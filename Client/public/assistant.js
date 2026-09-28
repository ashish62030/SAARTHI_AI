(function () {


    // userData

    const script = document.currentScript;

    const userId = script?.dataset?.userId

    const theme = "dark"

    let assistantConfig = null


    // load CSS

    const link = document.createElement("link")

    link.rel = "stylesheet"

    link.href = "http://localhost:5173/assistant.css"

    document.head.appendChild(link)


    // Create PopUp

    const popup = document.createElement("div")

    popup.className = `saarthi-popup theme-${theme}`

    popup.innerHTML = `
    <div class="saarthi-overlay"></div>

    <div class="saarthi-content">

       <div class="saarthi-top">
            <div class="saarthi-orb-wrap">

                <div class="saarthi-orb-glow"></div>

                <div class="saarthi-orb"></div>

            </div>

            <h2 class="saarthi-title">
                Hello! I'm Saarthi AI
            </h2>

            <p class="saarthi-sub">
                Your smart voice assistant.
                <br />
                Ask anything about your website.
            </p>


            <div class="saarthi-status">
                Tap button to Speak
            </div>

            <div class="saarthi-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <!-- User Text -->
            <div class="saarthi-user-text">
            </div>

            <!-- AI Text -->
            <div class="saarthi-ai-text">
            </div>
  
        </div>


        <div class="saarthi-bottom">
            
            <button class="saarthi-mic">

               <img 
               src="http://localhost:5173/mic.svg"
               alt="mic"
               class="saarthi-mic-icon"/>
            </button>
        </div>
    </div>
    
    `;

    document.body.appendChild(popup);

    // floating Button

    const button = document.createElement("button")

    button.className = `saarthi-btn theme-${theme}`

    button.innerHTML = `
    <img 
    src="http://localhost:5173/logo.png"
    alt="logo"
    />`;
    document.body.appendChild(button)




    // toggle popup

    let open = false
    let recognition = null
    let pendingAskController = null
    let pendingAskTimeout = null
    let navigationTimeout = null

    const resetAssistant = () => {
        window.speechSynthesis?.cancel()
        recognition?.abort()
        pendingAskController?.abort()
        pendingAskController = null
        clearTimeout(pendingAskTimeout)
        clearTimeout(navigationTimeout)
        pendingAskTimeout = null
        navigationTimeout = null
        wave.style.opacity = "0"
        status.innerText = "Tap button to Speak"
        userText.innerText = ""
        aiText.innerText = ""
    }

    button.onclick = () => {
        open = !open;
        popup.style.display = open ? "flex" : "none";

        if (!open) {
            resetAssistant()
        } else {
            status.innerText = "Tap button to Speak"
        }
    }


    // load Assistant

    const loadAssistant = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/assistant/config/${userId}`)

            const data = await res.json()

            if (data) {
                assistantConfig = data.user
                applyConfig()
            }

        } catch (error) {
            console.log(
                "Assistant Load Error:",
                error
            );
        }
    }


    const applyConfig = () => {
        if (!assistantConfig) return;

        popup.className = `saarthi-popup theme-${assistantConfig.theme}`

        button.className = `saarthi-btn theme-${assistantConfig.theme}`

        const title = popup.querySelector(".saarthi-title")

        title.innerHTML = `Hello! I'm ${assistantConfig.assistantName}`;

        const subTitle = popup.querySelector(".saarthi-sub")
        subTitle.innerHTML = `
    Welcome to
    ${assistantConfig.businessName}.
    <br />
    Ask anything about your website.
  `;


    }

    loadAssistant()


    // Element


    const status =
        popup.querySelector(
            ".saarthi-status"
        );

    const wave =
        popup.querySelector(
            ".saarthi-wave"
        );

    const userText =
        popup.querySelector(
            ".saarthi-user-text"
        );

    const aiText =
        popup.querySelector(
            ".saarthi-ai-text"
        );

    const mic =
        popup.querySelector(
            ".saarthi-mic"
        );



    // text-speech

    const speak = (text) => {
        window.speechSynthesis.cancel();

        // Show AI response
        aiText.innerText =
            text;

        status.innerText =
            "AI Speaking...";

        const speech = new SpeechSynthesisUtterance(text)

        speech.lang =
            "hi-IN";

        speech.rate = 1;

        speech.pitch = 1;

        speech.volume = 1;

        // Voice end
        speech.onend = () => {
            if (!open) return;

            status.innerText =
                "Tap button to Speak";

            wave.style.opacity =
                "0";
        };

        // Start speaking
        window.speechSynthesis.speak(
            speech
        );
    }


    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition


    if(SpeechRecognition){

        recognition = new SpeechRecognition();

        recognition.lang =
      "en-US";

    recognition.continuous =
      false;

    recognition.interimResults =
      false;


      mic.onclick=()=>{
        window.speechSynthesis?.cancel()
        wave.style.opacity =
        "1";

      status.innerText =
        "Listening...";

      userText.innerText =
        "";

      aiText.innerText =
        "";

      recognition.start();
      }


      recognition.onresult = (e)=>{
        const text = e.results[0][0].transcript

        userText.innerText = "You: " + text;

        recognition.stop();


        pendingAskTimeout = setTimeout( async () => {
            const controller = new AbortController()
            pendingAskController = controller
            try {
                if (!open) return
                status.innerText = "Thinking...";
                

                const res = await fetch("http://localhost:8000/api/assistant/ask" , {
                    method:"POST",
                    headers:{
                        "Content-Type":
                      "application/json",
                    } ,
                    body:JSON.stringify({
                        message:text,
                        userId
                    }),
                    signal: controller.signal,
                })

                const data = await res.json()
                console.log(data)

                if (!open || controller.signal.aborted) return

                if(data.success){

                    if(data.action === "navigate"){
                        speak(data.response)

                        navigationTimeout = setTimeout(()=>{
                            window.location.href = data.path

                        },1500)

                    }else{
                        speak(data.aiResponse)
                    }

                }else{
                    speak(data.message || "Response error. Please check your assistant setup.")

                }



            } catch (error) {
                if (error.name === "AbortError") return
                console.log(error)
                speak("AI Server Error")
            } finally {
                if (pendingAskController === controller) {
                    pendingAskController = null
                }
            }
        },600)
      };

      recognition.onerror = ()=>{
        if (!open) return
        status.innerText =
          "Tap button to Speak";

        wave.style.opacity =
          "0";
      }


    }
    else{
        status.innerText =
      "Speech Recognition not supported";
    }


})();

