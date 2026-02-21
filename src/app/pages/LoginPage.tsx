  import { GlassCard } from "../components/GlassCard";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError || !authData.user) {
      setError(authError?.message || "Login failed");
      setLoading(false);
      return;
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

    if (profile?.role === "student")
      navigate("/dashboard/student");

    else if (profile?.role === "teacher")
      navigate("/dashboard/teacher");

    else if (profile?.role === "admin")
      navigate("/dashboard/admin");

    setLoading(false);

  };



  return (

<div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#020617]">

<GlassCard className="
w-[900px]
h-[500px]
flex
overflow-hidden
rounded-2xl
border border-cyan-400/30
shadow-[0_0_60px_rgba(0,255,255,0.25)]
">

{/* LEFT SIDE */}

<div className="
w-1/2
px-16
flex
flex-col
justify-center
bg-[#0f172a]
">

<h2 className="text-3xl font-semibold text-white mb-10">
Login
</h2>



<form onSubmit={handleLogin} className="space-y-6">


{/* EMAIL */}

<div className="relative">

<Mail className="absolute right-3 top-3 text-gray-400"/>

<input

type="email"

placeholder="Username"

value={email}

onChange={(e)=>setEmail(e.target.value)}

className="
w-full
bg-white/10
border border-white/20
rounded-md
px-4
py-3
text-white
focus:border-cyan-400
focus:ring-2
focus:ring-cyan-400/40
outline-none
transition
"

/>

</div>



{/* PASSWORD */}

<div className="relative">

<Lock className="absolute right-3 top-3 text-gray-400"/>

<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

className="
w-full
bg-white/10
border border-white/20
rounded-md
px-4
py-3
text-white
focus:border-cyan-400
focus:ring-2
focus:ring-cyan-400/40
outline-none
transition
"

/>

</div>



{/* BUTTON */}

<button

type="submit"

disabled={loading}

className="
w-full
mt-4
py-3
rounded-full
bg-gradient-to-r
from-cyan-500
to-light blue-500
text-white
font-medium
hover:scale-[1.03]
hover:shadow-lg
transition
"

>

{loading ? "Signing in..." : "Login"}

</button>


{error &&

<p className="text-red-400 text-sm">

{error}

</p>

}


</form>


<p className="mt-8 text-gray-400 text-sm">

Don't have an account?

<a href="/signup" className="text-cyan-400 ml-2 hover:underline">

Sign Up

</a>

</p>


</div>




{/* RIGHT SIDE */}



<div className="w-1/2 relative">

{/* gradient */}

<div className="
absolute
inset-0
bg-gradient-to-br
from-cyan-500
to-blue-600
"/>



{/* diagonal cut */}

<div className="
absolute
inset-0
bg-[#0f172a]
[clip-path:polygon(0_0,55%_0,35%_100%,0_100%)]
"/>



{/* text */}

<div className="
absolute
right-16
top-1/2
translate-y-[-50%]
text-white
text-4xl
font-bold
leading-tight
">

WELCOME
<br/>
BACK!

</div>


</div>



</GlassCard>

</div>

);

}
 
