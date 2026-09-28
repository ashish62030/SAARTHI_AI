import axios from 'axios';
import { useEffect, useState } from 'react'
import { FiCheckCircle, FiCopy, FiPlus, FiTrash2 } from 'react-icons/fi';
import { CLIENT_URL, ServerUrl } from '../App';
import toast from 'react-hot-toast';

const THEMES = [
  "light",
  "dark",
  "glass",
  "neon",
];

const TONES = [
  "friendly",
  "professional",
  "sales",
];

function Builder({user , setUser}) {

  const [editAssistant , setEditAssistant] = useState(!user?.isSetupComplete)

  const [assistantName , setAssistantName] = useState(user?.assistantName || "");

  const [businessName , setBusinessName] = useState(user?.businessName || "")
  
  const [businessType , setBusinessType] = useState(user?.businessType || "")

  const [businessDescription , setBusinessDescription] = useState(user?.businessDescription || "")

  const [theme,setTheme] = useState(user?.theme || "dark")
  const [tone,setTone] = useState(user?.tone || "friendly")

  const [geminiApiKey , setGeminiApiKey] = useState(user?.geminiApiKey || "")

  const [pages, setPages] = useState(user?.pages || []);

  const [pageName, setPageName] = useState("");

  const [pagePath, setPagePath] = useState("");

  const [pageKeywords, setPageKeywords] = useState("");

  const [loading,setLoading]= useState(false)
  const [currentTime, setCurrentTime] = useState(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCurrentTime(Date.now()))
    return () => cancelAnimationFrame(frame)
  }, [])

  const addPage = ()=>{
    if(!pageName || !pagePath) return;

    const newPage = {
      name:pageName,
      path:pagePath,
      keywords:pageKeywords.split(",").map((k) => k.trim()) 
      
    
    }

    setPages([...pages,newPage])

    setPageName("")
    setPagePath("")
    setPageKeywords("")
    
  }

  const removePage = (index) =>{
    const updatePages = pages.filter((_,i)=>i !== index)

    setPages(updatePages)
  }


  const saveAssistant = async () => {
    setLoading(true)
    try {
      const data={
        assistantName,
        businessName,
        businessType,
        businessDescription,
        tone,
        theme,
        geminiApiKey,
        pages,
      }

      const res = await axios.post(ServerUrl + "/api/user/save-assistant" , data , {withCredentials:true})
      console.log(res.data)
      setUser(res.data.user)
      setEditAssistant(false)
      toast.success("Assistant Saved Successfully")
      setLoading(false)
    } catch (error) {
      toast.error("Failed to save assistant")
      console.log(error)
      setLoading(false)
    }
    
  }

    const remainingMessages =
    Math.max(
      0,
      (user?.requestLimit || 0) -
      (user?.totalMessages || 0)
    );

    const remainingDays =
    user?.proExpiresAt
      ? Math.max(
        0,
        Math.ceil(
          (
            new Date(
              user.proExpiresAt
            ) - new Date()
          ) /
          (1000 * 60 * 60 * 24)
        )
      )
      : 0;

    const isProActive = user?.plan === "pro" &&
      user?.proExpiresAt &&
      currentTime !== null &&
      new Date(user.proExpiresAt).getTime() > currentTime;



     const embedCode = `<script src="${CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>`;
     const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100";

  return (
    <div className='min-h-screen bg-[radial-gradient(ellipse_at_top,_#f4efff_0,_#f7f8fc_38rem)] px-4 py-8 sm:py-10'>
      <div className='mx-auto max-w-5xl'>
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-purple-600'>Workspace / Assistant</p>
          <h2 className='mt-2 text-3xl font-bold tracking-tight text-[#081028] sm:text-4xl'>
            Assistant Builder
          </h2>
          <p className='mt-2 text-sm text-slate-500 sm:text-base'> Customize your virtual
            assistant</p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold ${user?.isSetupComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
            <span className={`h-2 w-2 rounded-full ${user?.isSetupComplete ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {user?.isSetupComplete ? 'Assistant is ready' : 'Finish your setup'}
          </div>
        </div>

        {user.isSetupComplete && !editAssistant &&(
          <div className='mb-6 overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)]'>
           <div className='h-1.5 bg-gradient-to-r from-purple-500 via-violet-400 to-emerald-400' />
           <div className='p-6 sm:p-8'>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-600">
                Your assistant
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#081028]">
                {user.assistantName}
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-500">
                Your assistant is configured. Copy the embed snippet below to add it to your website.
              </p>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6'>


                <div className='rounded-2xl border border-slate-100 bg-slate-50/80 p-4'>
                  
                  <p className='text-sm text-gray-400'>Current Plan</p>
                  <h2 className='text-xl font-bold text-[#081028] mt-1 capitalize'>{isProActive ? "pro" : "free"}</h2>
                </div>


                <div className='rounded-2xl border border-slate-100 bg-slate-50/80 p-4'>
                  
                  <p className='text-sm text-gray-400'>Gemini Status</p>
                  <h2 className={`text-xl font-bold mt-1 capitalize ${user?.geminiStatus === "active"
                      ? "text-emerald-600"
                      : user?.geminiStatus === "invalid"
                        ? "text-red-500"
                        : "text-amber-500"
                    }`}>{user?.geminiStatus}</h2>
                </div>

                 <div className='rounded-2xl border border-slate-100 bg-slate-50/80 p-4'>
                  
                  <p className='text-sm text-gray-400'>{!isProActive
                      ? "Messages Left"
                      : "Plan Expiry"}</p>
                  <h2 className='text-xl font-bold text-[#081028] mt-1 capitalize'>{!isProActive
                      ? remainingMessages
                      : `${remainingDays} Days`}</h2>
                </div>
              </div>

              <div className='mt-7'>

                <div className='mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4'>
                  <p className='flex items-center gap-2 text-sm font-semibold text-amber-950'>
                    <FiCheckCircle className='text-amber-700' />
                    Where to paste this script?
                  </p>
                  <p className='text-sm text-amber-700 mt-2 leading-6'>
                    Paste this script before the closing
                    {" "}
                    <span className="font-semibold">
                      {"</body>"}
                    </span>
                    {" "}
                    tag of your website HTML file.
                    <br />
                    <br />
                    Example:
                  </p>

                  <pre className='mt-3 bg-[#0b1020] text-emerald-400 rounded-xl p-3 text-xs font-mono overflow-x-auto'>
                     {`<body>

  Your Website Content

  <script src="${CLIENT_URL}/assistant.js" data-user-id="${user?._id}"></script>

</body>`}
                  </pre>
                </div>

                <p className='text-sm font-medium text-[#081028] mb-3 mt-3'>Embed Code</p>
              </div>

              <div className='relative'>
               <textarea aria-label='Assistant embed code' readOnly value={embedCode} className='h-20 w-full resize-none rounded-2xl border border-slate-800 bg-[#0b1020] p-4 pr-16 font-mono text-sm text-emerald-300 outline-none focus-visible:ring-2 focus-visible:ring-purple-400'/>
                <button type="button" aria-label="Copy embed code" onClick={()=>{
                  navigator.clipboard.writeText(embedCode);
                  toast.success("Copied")
                }} className='absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition hover:bg-purple-50 hover:text-purple-700'><FiCopy/></button>
              </div>


              <button type="button" onClick={()=>setEditAssistant(true)} className='mt-6 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-500 px-6 font-semibold text-white shadow-lg shadow-purple-500/15 transition hover:-translate-y-0.5 hover:shadow-xl'>Edit Assistant</button>


          </div>
          </div>

          
        )}

        {editAssistant && <div className='space-y-5 sm:space-y-6'>

          <div className='rounded-[26px] border border-white bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.06)] sm:p-8'>
            <h2 className='text-lg font-bold tracking-tight text-slate-900'>Business information</h2>
            <p className='mb-5 mt-1 text-sm text-slate-500'>Give your assistant the context it needs to help visitors.</p>

            <div className='space-y-4'>
              <input type="text" 
              onChange={(e)=>setAssistantName(e.target.value)}
              value={assistantName}
              placeholder="Assistant Name"
              className={inputClass} />

              <input type="text" 
              onChange={(e)=>setBusinessName(e.target.value)}
              value={businessName}
              placeholder="Business Name"
              className={inputClass} />

              <input type="text" 
              onChange={(e)=>setBusinessType(e.target.value)}
              value={businessType}
              placeholder="Business Type"
              className={inputClass} />

              <textarea type="text" 
              rows={4}
              onChange={(e)=>setBusinessDescription(e.target.value)}
              value={businessDescription}
              placeholder="Business Description"
              className={`${inputClass} min-h-28 resize-y`} />


            </div>
          </div>

          <div className='rounded-[26px] border border-white bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.06)] sm:p-8'>
            <h2 className='text-lg font-bold tracking-tight text-slate-900'>
              Appearance
            </h2>
            <p className='mb-5 mt-1 text-sm text-slate-500'>Make the assistant feel at home on your website.</p>

            <div>
              <label  className='text-sm text-gray-600 mb-3 block'>Theme</label>

              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                {THEMES.map((item)=>(
                  <button key={item}
                  onClick={()=>setTheme(item)}
                  type="button"
                  className={`rounded-xl border px-4 py-3 capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 ${theme === item
                        ? "border-purple-300 bg-purple-50 font-semibold text-purple-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/50"
                        }`}>{item}
                  </button>
                ))}
              </div>
            </div>


            <div className='mt-6'>
              <label  className='text-sm text-gray-600 mb-3 block'>Assistant Tone</label>

              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {TONES.map((item)=>(
                  <button key={item}
                  onClick={()=>setTone(item)}
                  type="button"
                  className={`rounded-xl border px-4 py-3 capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 ${tone === item
                        ? "border-purple-300 bg-purple-50 font-semibold text-purple-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:bg-purple-50/50"
                        }`}>{item}
                  </button>
                ))}
              </div>
            </div>

          </div>


          <div className='rounded-[26px] border border-white bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.06)] sm:p-8'>
            <div className='mb-5 flex flex-wrap items-center justify-between gap-4'>
              <div>
                <h2 className='text-lg font-bold tracking-tight text-slate-900'>
                  Gemini API KEY
                </h2>
                <p className='text-sm text-gray-400 mt-1'>
                  Add your Gemini API key to power your assistant
                </p>
              </div>

              <a href="https://aistudio.google.com/app/apikey"
              target='_blank'
              rel='noopener noreferrer'
              className='cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105'>
                Get API KEY
              </a>
            </div>

            <input type="password" 
            placeholder="AIza..."
            onChange={(e)=>setGeminiApiKey(e.target.value)}
            value={geminiApiKey}
            className={inputClass} />

            <p className='text-xs text-gray-400 mt-3 leading-6'>
               Your API key is securely stored and only used for generating AI responses.
            </p>
          </div>

          <div className='rounded-[26px] border border-white bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.06)] sm:p-8'>
            <div className='mb-5 flex flex-wrap items-center justify-between gap-4'>
              <div>
                <h2 className='text-lg font-bold tracking-tight text-slate-900'>Navigation pages</h2>
                <p className='text-sm text-gray-400'>
                  Assistant can redirect users
                </p>
              </div>

              <button type="button" onClick={addPage} className='flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105'>
                <FiPlus/>Add
              </button>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <input type="text" placeholder='Page name' className={inputClass}
              onChange={(e)=>setPageName(e.target.value)}
              value={pageName}/>

              <input type="text" placeholder='/pricing' className={inputClass}
              onChange={(e)=>setPagePath(e.target.value)}
              value={pagePath}/>

              <input type="text" placeholder='Pricing plan' className={inputClass}
              onChange={(e)=>setPageKeywords(e.target.value)}
              value={pageKeywords}/>
            </div>

            <div className='mt-5 space-y-3'>
              {
                pages.map((page,index)=>(
                  <div key={index}
                  className='flex items-center justify-between border border-gray-100 rounded-2xl p-4'>

                    <div>
                      <p className='font-medium'>{page.name}</p>
                      <p className='text-sm text-gray-400'>{page.path}</p>
                  
                    </div>
                    <button onClick={()=>removePage(index)} className='text-red-500'>
                      <FiTrash2/>

                    </button>
                  </div>
                ))
              }
            </div>
          </div>

          <button type="button" onClick={saveAssistant}
          disabled={loading || 
             !assistantName ||
        !businessName  ||
        !businessType ||
        !businessDescription ||
        !geminiApiKey} className='sticky bottom-4 z-20 h-14 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-500 font-semibold text-white shadow-[0_14px_35px_rgba(109,40,217,0.3)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50'>
            {
              loading ? "Saving..." : user.isSetupComplete ? "Update Assistant" : "Save Assistant"
            }
          </button>

        </div>}

      </div>
      
    </div>
  )
}

export default Builder
