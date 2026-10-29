import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button, Spinner } from '@/components/ui';
import { LanguageSelector } from '@/components/UniversalHeader';


export function AuthScreen() {

  const { t } = useTranslation();

  const { signIn, signUp, user } = useAuth();

  const navigate = useNavigate();


  useEffect(() => {

    if (user) {
      navigate('/setup');
    }

  }, [user, navigate]);



  const [mode, setMode] =
    useState<'login' | 'register'>('login');


  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [name, setName] = useState('');

  const [error, setError] =
    useState<string | null>(null);


  const [busy, setBusy] =
    useState(false);



  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    setError(null);

    setBusy(true);


    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, name);


    setBusy(false);


    if (result.error) {

      setError(result.error);

    }

  };



  return (

    <div className="
      min-h-screen
      overflow-y-auto
      bg-gradient-to-br
      from-teal-600
      via-emerald-600
      to-cyan-700
      flex
      items-center
      justify-center
      p-4
    ">


      {/* Background Effects */}

      <div className="
        absolute
        inset-0
        overflow-hidden
      ">

        <div className="
          absolute
          top-10
          left-10
          w-64
          h-64
          bg-white/10
          rounded-full
          blur-3xl
        " />


        <div className="
          absolute
          bottom-10
          right-10
          w-72
          h-72
          bg-cyan-300/10
          rounded-full
          blur-3xl
        " />


      </div>



      {/* Language */}

      <div className="
        absolute
        top-4
        right-4
        z-10
      ">

        <div className="
          rounded-xl
          bg-white/15
          backdrop-blur-sm
          px-2
          py-1
        ">

          <LanguageSelector compact />

        </div>


      </div>



      <div className="
  relative
  w-full
  max-w-md
  mx-auto
  px-2
  py-6
">


        {/* Logo */}

        <div className="
          text-center
          mb-5
        ">


          <div className="
            inline-flex
            items-center
            justify-center
            w-14
            h-14
            rounded-2xl
            bg-white/15
            backdrop-blur-sm
            mb-3
          ">

            <Sparkles
              className="text-white"
              size={28}
            />

          </div>



          <h1 className="
            text-3xl
            font-bold
            text-white
          ">

            {t('appName')}

          </h1>


          <p className="
            text-teal-100
            mt-2
            text-sm
          ">

            {t('tagline')}

          </p>


        </div>
                {/* Login Card */}

        <div className="
          bg-white
          rounded-3xl
          shadow-2xl
          p-5
          sm:p-7
        ">


          {/* Toggle */}

          <div className="
            flex
            gap-2
            mb-5
            p-1
            bg-gray-100
            rounded-xl
          ">


            <button
              type="button"
              onClick={()=>{
                setMode('login');
                setError(null);
              }}
              className={`
                flex-1
                rounded-lg
                py-3
                text-sm
                font-semibold
                transition-all
                ${
                  mode === 'login'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500'
                }
              `}
            >
              {t('signIn')}
            </button>



            <button
              type="button"
              onClick={()=>{
                setMode('register');
                setError(null);
              }}
              className={`
                flex-1
                rounded-lg
                py-3
                text-sm
                font-semibold
                transition-all
                ${
                  mode === 'register'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500'
                }
              `}
            >
              {t('signUp')}
            </button>


          </div>



          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >


            {mode === 'register' && (

              <div>

                <label className="
                  block
                  text-sm
                  font-medium
                  text-gray-700
                  mb-1.5
                ">
                  {t('yourName')}
                </label>


                <input
                  type="text"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  placeholder={t('parent')}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    focus:border-teal-500
                    focus:ring-2
                    focus:ring-teal-500/20
                    focus:outline-none
                  "
                />

              </div>

            )}



            {/* Email */}

            <div>

              <label className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              ">
                {t('email')}
              </label>


              <div className="relative">


                <Mail
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                  size={18}
                />


                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    pl-10
                    pr-4
                    py-3
                    text-sm
                    focus:border-teal-500
                    focus:ring-2
                    focus:ring-teal-500/20
                    focus:outline-none
                  "
                />


              </div>


            </div>




            {/* Password */}

            <div>


              <label className="
                block
                text-sm
                font-medium
                text-gray-700
                mb-1.5
              ">
                {t('password')}
              </label>



              <div className="relative">


                <Lock
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                  size={18}
                />


                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder="******"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    pl-10
                    pr-4
                    py-3
                    text-sm
                    focus:border-teal-500
                    focus:ring-2
                    focus:ring-teal-500/20
                    focus:outline-none
                  "
                />


              </div>


            </div>




            {error && (

              <div className="
                rounded-xl
                bg-red-50
                border
                border-red-100
                px-4
                py-3
                text-sm
                text-red-600
              ">

                {error}

              </div>

            )}





            <Button
              type="submit"
              fullWidth
              disabled={busy}
              className="
                bg-teal-600
                hover:bg-teal-700
                py-3
                rounded-xl
              "
            >

              {busy ? (

                <Spinner />

              ) : (

                <>

                  {mode === 'login'
                    ? t('signIn')
                    : t('signUp')
                  }


                  <ArrowRight size={17}/>


                </>

              )}


            </Button>


          </form>




          <p className="
            text-center
            text-xs
            text-gray-400
            mt-5
          ">

            {t('byContinuing')}

          </p>



        </div>




        <p className="
          text-center
          mt-5
        ">

          <Link
            to="/"
            className="
              text-teal-100
              text-sm
              hover:text-white
            "
          >

            {t('backToWelcome')}

          </Link>


        </p>



      </div>


    </div>

  );

}
