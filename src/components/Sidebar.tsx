import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';


export function Sidebar({ role }: { role: string }) {

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeMember = auth?.activeMember;
  const members = auth?.members || [];
  const setActiveMember = auth?.setActiveMember;
  const currentFamily = auth?.family || auth?.currentFamily;
  const signOut = auth?.signOut;


  const menuItems = [
    {
      id: 'dashboard',
      label: '🏠 Home',
      path: '/dashboard',
    },
    {
      id: 'tasks',
      label: '✅ Tasks',
      path: '/tasks',
    },
    {
      id: 'rewards',
      label: '🎁 Rewards',
      path: '/rewards',
    },
    {
      id: 'growth',
      label: '📈 Growth',
      path: '/growth',
    },
    {
      id: 'aicoach',
      label: '🤖 AI Coach',
      path: '/aicoach',
    },
    {
      id: 'family',
      label: '👨‍👩‍👧 Family',
      path: '/family',
    },
  ];


  return (

    <aside className="
      hidden lg:flex
      w-64
      min-h-screen
      flex-col
      justify-between
      p-5
      bg-white
      border-r
    ">


      <div>


        {/* Logo */}

        <div className="flex items-center gap-3 mb-8">

          <div className="
            w-10 h-10 
            rounded-xl 
            bg-gradient-to-tr 
            from-rose-500 
            to-pink-500
            flex items-center justify-center
            text-white
            text-xl
          ">
            🌱
          </div>


          <div>

            <h1 className="font-bold text-gray-800 text-lg">
              Life Pilot AI
            </h1>


            <p className="text-xs text-gray-400">
              {currentFamily?.name || 'Family Growth'}
            </p>

          </div>

        </div>



        {/* Profile Switcher */}


        <div className="
          mb-6
          p-3
          bg-gray-50
          rounded-xl
          border
        ">


          <label className="
            text-xs
            font-semibold
            text-gray-400
            block
            mb-2
          ">
            Active Profile
          </label>



          <select

            value={activeMember?.id || ''}

            onChange={(e)=>{

              const member = members.find(
                (m:any)=>m.id === e.target.value
              );


              if(member && setActiveMember){

                setActiveMember(member);

              }

            }}

            className="
              w-full
              p-2
              rounded-lg
              border
              text-sm
            "

          >


            {members.map((member:any)=>(

              <option 
                key={member.id}
                value={member.id}
              >

                {member.avatar_emoji || '👤'} {member.name}

              </option>

            ))}


          </select>


        </div>



        {/* Desktop Menu */}


        <nav className="space-y-1">


          {menuItems.map((item)=>{


            const active =
              location.pathname === item.path ||
              (
                item.path === '/dashboard' &&
                location.pathname === '/'
              );


            return (


              <button

                key={item.id}

                type="button"

                onClick={()=>navigate(item.path)}

                className={`
                  w-full
                  text-left
                  flex
                  items-center
                  gap-3
                  px-3
                  py-3
                  rounded-xl
                  text-sm
                  font-medium
                  transition-all

                  ${
                    active
                    ? 'bg-rose-50 text-rose-600 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                  }

                `}

              >

                {item.label}


              </button>


            );


          })}


        </nav>


      </div>
      
      {/* Bottom Actions */}

      <div className="
        pt-4
        border-t
        space-y-2
      ">


        <button

          type="button"

          onClick={()=>navigate('/family')}

          className="
            w-full
            py-2.5
            px-3
            bg-gradient-to-r
            from-rose-500
            to-pink-500
            text-white
            rounded-xl
            text-xs
            font-semibold
          "

        >

          ➕ Add Child / Manage Family

        </button>



        {signOut && (

          <button

            type="button"

            onClick={()=>signOut()}

            className="
              w-full
              py-2
              px-3
              text-gray-500
              hover:text-rose-600
              text-xs
            "

          >

            🚪 Sign Out

          </button>

        )}


      </div>


    </aside>

  );

}




// ===============================
// MOBILE BOTTOM NAVIGATION
// ===============================


export function MobileBottomNav({ role }: { role:string }) {


  const navigate = useNavigate();
  const location = useLocation();


  const items = [

    {
      icon:"🏠",
      label:"Home",
      path:"/dashboard"
    },

    {
      icon:"✅",
      label:"Tasks",
      path:"/tasks"
    },

    {
      icon:"🎁",
      label:"Rewards",
      path:"/rewards"
    },

    {
      icon:"🤖",
      label:"AI",
      path:"/aicoach"
    },

    {
      icon:"👨‍👩‍👧",
      label:"Family",
      path:"/family"
    }

  ];



  return (

    <div className="
      fixed
      bottom-0
      left-0
      right-0
      z-50
      lg:hidden
      bg-white
      border-t
      shadow-lg
      flex
      justify-around
      py-2
    ">


      {items.map((item)=>(


        <button

          key={item.path}

          onClick={()=>navigate(item.path)}

          className={`
            flex
            flex-col
            items-center
            text-xs
            px-3
            py-1
            rounded-xl

            ${
              location.pathname === item.path
              ? "text-rose-600 bg-rose-50"
              : "text-gray-500"
            }

          `}

        >

          <span className="text-lg">
            {item.icon}
          </span>


          <span>
            {item.label}
          </span>


        </button>


      ))}


    </div>

  );

}




// ===============================
// TOP BAR
// ===============================


export function TopBar({

  title,
  subtitle,
  right

}:{

  title:string;

  subtitle?:string;

  right?:React.ReactNode;

}){


 const auth = useAuth();

 const activeMember = auth?.activeMember;

 const signOut = auth?.signOut;



 return (

<div className="
  flex
  items-center
  justify-between
  px-5
  py-4
  lg:px-8
  lg:py-6
">


<div>


<h1 className="
 text-xl
 lg:text-2xl
 font-bold
 text-gray-900
">

{title}

</h1>



{subtitle && (

<p className="
 text-sm
 text-gray-500
 mt-1
">

{subtitle}

</p>

)}


</div>




<div className="
 flex
 items-center
 gap-3
">


{right}




{activeMember && (

<div className="
 hidden
 sm:flex
 items-center
 gap-2
 bg-gray-50
 px-3
 py-1.5
 rounded-full
 border
">

<span>

{activeMember.avatar_emoji || '👤'}

</span>


<span className="text-sm font-semibold">

{activeMember.name}

</span>


</div>

)}




{signOut && (

<button

onClick={()=>signOut()}

className="
px-3
py-1.5
border
rounded-lg
text-xs
"

>

Sign Out

</button>

)}



</div>


</div>


);


}
