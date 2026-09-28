import { HiOutlineSparkles, HiOutlineMicrophone } from "react-icons/hi";
import { HiOutlineBolt, HiOutlineCodeBracket } from "react-icons/hi2";
import { FcGoogle } from "react-icons/fc";
import logo from "../assets/logo.png"
import AssistantPreview from "../Components/AssistantPreview"
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from "axios"
import { ServerUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
function Login({setUser}) {
    const navigate = useNavigate()
    const FEATURES = [
        {
            icon:
                <HiOutlineMicrophone />,

            title:
                "Voice AI",

            desc:
                "Natural real-time voice conversations.",
        },

        {
            icon:
                <HiOutlineSparkles />,

            title:
                "Smart Navigation",

            desc:
                "Navigate pages using voice commands.",
        },

        {
            icon:
                <HiOutlineCodeBracket />,

            title:
                "Easy Embed",

            desc:
                "Add assistant using one script tag.",
        },

        {
            icon:
                <HiOutlineBolt />,

            title:
                "Fast Responses",

            desc:
                "Optimized Gemini AI responses.",
        },

    ];


    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth,provider)
           const {displayName , email} = result.user
           const res = await axios.post(ServerUrl + "/api/auth/google" , { name:displayName , email} , {withCredentials:true})
           setUser(res.data)
           toast.success("Login Successfully")
           navigate("/")
        } catch (error) {
            toast.error("Login Failed...")
            console.log(error)
        }
    }
    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-emerald-50 overflow-hidden'>
            <div className='max-w-7xl mx-auto px-6 py-16 lg:py-24'>

                <div className='grid lg:grid-cols-2 gap-16 items-center'>
                    {/* left */}
                    <div>
                        <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-100 text-purple-600 text-sm font-medium'>
                            <HiOutlineSparkles />

                            AI Voice Assistant Platform
                        </div>

                        <h1 className='mt-8 text-5xl lg:text-7xl font-black leading-tight text-[#081028]'>
                            Build AI Assistants
                            <span className='block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-emerald-500'>For Any Website</span>
                        </h1>

                        <p className='mt-8 text-lg text-[#475569] leading-8 max-w-2xl'>
                            Create customizable AI voice assistants that talk,
                            guide users, and integrate into any website instantly.
                        </p>


                        <button onClick={handleLogin} className='mt-10 h-16 px-8 rounded-2xl bg-gradient-to-r from-purple-500 to-emerald-500 text-white text-lg font-semibold flex items-center gap-4 shadow-[0_20px_80px_rgba(139,92,246,0.25)] hover:scale-[1.02] transition cursor-pointer'>
                            <FcGoogle className='text-3xl bg-white rounded-full' />
                            Continue with Google
                        </button>

                        <p className='mt-4 text-sm text-[#64748b]'>Free plan includes 200 AI responses</p>


                    </div>

                    {/* Interactive demo */}
                    <div className='relative flex justify-center lg:justify-end'>
                        <div className='absolute inset-10 bg-gradient-to-r from-purple-200/60 to-emerald-200/50 blur-[110px]' />
                        <div className='relative w-full'>
                            <AssistantPreview />
                        </div>
                    </div>


                </div>

                <section className='mt-8 sm:mt-12' aria-labelledby='login-features-heading'>
                    <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
                        <div>
                            <p className='text-sm font-semibold text-purple-600'>Everything your visitors need</p>
                            <h2 id='login-features-heading' className='mt-1 text-2xl font-bold text-[#081028] sm:text-3xl'>A helpful voice on every page</h2>
                        </div>
                        <img src={logo} alt='' aria-hidden='true' className='hidden h-10 w-auto object-contain sm:block' />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                        {FEATURES.map(({ icon, title, desc }) => (
                            <div key={title} className='flex gap-4 rounded-2xl border border-black/5 bg-white/80 p-5 shadow-sm'>
                                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-emerald-500 text-xl text-white'>
                                    {icon}
                                </div>
                                <div>
                                    <h3 className='font-semibold text-[#081028]'>{title}</h3>
                                    <p className='mt-1 text-sm leading-6 text-[#64748b]'>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

        </div>
    )
}

export default Login
