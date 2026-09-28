import axios from 'axios';
import { useEffect, useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ServerUrl } from '../App';

const freeFeatures = ["200 AI messages", "Voice assistant", "Navigation support", "Basic customization"]
const proFeatures = ["Unlimited AI messages", "Advanced AI assistant", "Priority performance", "Unlimited navigation", "Premium support"]

function FeatureList({ items, premium = false }) {
  return (
    <ul className={`mt-6 space-y-3.5 ${premium ? 'text-white/90' : 'text-slate-600'}`}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6">
          <span className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${premium ? 'bg-white/15 text-emerald-200' : 'bg-emerald-50 text-emerald-600'}`}>
            <FiCheck size={11} strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function Billing({ user ,setUser}) {
  const navigate = useNavigate()
  const [currentTime, setCurrentTime] = useState(null)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCurrentTime(Date.now()))
    return () => cancelAnimationFrame(frame)
  }, [])

  const isProActive = user?.plan === "pro" &&
    user?.proExpiresAt &&
    currentTime !== null &&
    new Date(user.proExpiresAt).getTime() > currentTime
  const effectivePlan = isProActive ? "pro" : "free"

  useEffect(()=>{
    if(user && !user.isSetupComplete){
      toast.error(
        "Setup your assistant first"
      );


      navigate("/builder");


    }
  },[navigate, user])


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

      useEffect(() => {
        const verifyStripePayment = async () => {
          const params = new URLSearchParams(window.location.search)
          const sessionId = params.get("session_id")
          const canceled = params.get("canceled")

          if (canceled) {
            toast.error("Payment cancelled")
            navigate("/billing", { replace: true })
            return
          }

          if (!sessionId) return

          try {
            const verifyRes = await axios.post(
              ServerUrl + "/api/billing/verify",
              { sessionId },
              { withCredentials: true }
            )

            if (verifyRes.data.success) {
              toast.success("Payment successful")
              setUser(verifyRes.data.user)
            } else {
              toast.error("Payment verification failed")
            }
          } catch (error) {
            toast.error("Payment verification failed")
            console.log(error)
          } finally {
            navigate("/billing", { replace: true })
          }
        }

        verifyStripePayment()
      }, [navigate, setUser])


      const handlePay = async () => {
        try {
          const res = await axios.post(ServerUrl + "/api/billing/order" , {plan: "pro"} , {withCredentials:true})

          if (res.data.url) {
            window.location.href = res.data.url
            return
          }

          toast.error("Stripe checkout failed")
        } catch (error) {
            toast.error("Payment Failed")

      console.log(error);
        }
      }

  return (
    <div className='min-h-screen bg-[radial-gradient(ellipse_at_top,_#f4efff_0,_#f7f8fc_36rem)] px-4 py-8 sm:py-10'>

      <div className='mx-auto max-w-5xl'>

        <div className='mb-8'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-purple-600'>Workspace / Billing</p>
          <h2 className='mt-2 text-3xl font-bold tracking-tight text-[#081028] sm:text-4xl'>
            Billing & Subscription
          </h2>
          <p className='mt-2 text-sm text-slate-500 sm:text-base'>Manage your plan and keep track of assistant usage.</p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6'>


          <div className='rounded-2xl border border-white bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-6'>

            <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Current plan</p>
            <h2 className='mt-2 text-2xl font-bold capitalize tracking-tight text-[#081028]'>{effectivePlan}</h2>
          </div>


          <div className='rounded-2xl border border-white bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-6'>

            <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Gemini status</p>
            <span className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${user?.geminiStatus === "active"
              ? "bg-emerald-50 text-emerald-700"
              : user?.geminiStatus === "invalid"
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-700"
              }`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{user?.geminiStatus}</span>
          </div>

          <div className='rounded-2xl border border-white bg-white/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-6'>

            <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>{!isProActive
              ? "Messages Left"
              : "Plan Expiry"}</p>
            <h2 className='mt-2 text-2xl font-bold tracking-tight text-[#081028]'>{!isProActive
              ? remainingMessages
              : `${remainingDays} Days`}</h2>
          </div>
        </div>


        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-10'>

          {/* free */}

          <div className='rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_45px_rgba(15,23,42,0.05)] sm:p-8'>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Start free</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#081028]">
              Free Plan
            </h2>

            <h3 className="mt-4 text-5xl font-bold tracking-tight text-[#081028]">
              ₹0
            </h3>

            <p className="mt-1 text-sm text-slate-500">Free forever</p>
            <FeatureList items={freeFeatures} />

          </div>
          <div className='relative overflow-hidden rounded-[28px] border border-purple-400/20 bg-gradient-to-br from-[#17132f] via-[#3b2679] to-[#126e69] p-6 text-white shadow-[0_24px_60px_rgba(76,29,149,0.22)] sm:p-8'>
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">

            <h2 className="text-2xl font-bold tracking-tight text-white">
              Pro Plan
            </h2>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">More power</span>
            </div>

            <h3 className="relative mt-4 text-5xl font-bold tracking-tight text-white">
              ₹699
            </h3>

            <p className='relative mt-1 text-sm text-white/65'>3 months of access</p>

            {user?.plan === "pro" && !isProActive && (
              <p className='relative mt-4 rounded-xl border border-white/15 bg-white/10 p-3 text-sm text-white/90'>Your Pro plan has expired. Renew to restore Pro access.</p>
            )}

            <div className="relative"><FeatureList items={proFeatures} premium /></div>


            <button
            onClick={handlePay}

             disabled={isProActive} className={`mt-8 h-14 w-full rounded-2xl font-semibold shadow-lg transition ${isProActive
                  ? "cursor-default bg-emerald-200 text-emerald-950"
                  : "cursor-pointer bg-white text-[#17132f] hover:-translate-y-0.5 hover:bg-emerald-50"
                }`}>
                  {isProActive ? "Active Plan" : user?.plan === "pro" ? "Renew Plan" : "Upgrade Now"}

                </button>




          </div>
        </div>


      </div>

    </div>
  )
}

export default Billing
