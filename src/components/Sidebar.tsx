import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const auth = useAuth();
  const navigate = useNavigate();

  const activeMember = auth?.activeMember;
  const members = auth?.members || [];
  const setActiveMember = auth?.setActiveMember;
  const currentFamily = auth?.currentFamily;
  const signOut = auth?.signOut;

  const goTo = (path: string, tab: string) => {
    setActiveTab(tab);
    navigate(path);
  };

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', path: '/' },
    { id: 'tasks', label: '✅ Tasks', path: '/tasks' },
    { id: 'rewards', label: '🎁 Rewards', path: '/rewards' },
    { id: 'growth', label: '📈 Growth Score', path: '/growth' },
    { id: 'aicoach', label: '🤖 AI Coach', path: '/aicoach' },
    { id: 'family', label: '👨‍👩‍👧‍👦 Family & Children', path: '/family' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col justify-between">

      <div>

        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-pink-200">
            🌱
          </div>

          <div>
            <h1 className="font-bold text-gray-800 text-lg leading-tight">
              Life Pilot AI
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              {currentFamily?.name || 'Family Growth'}
            </p>
          </div>
        </div>


        <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">

          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2 px-1">
            Active Profile
          </label>

          <select
            value={activeMember?.id || ''}
            onChange={(e) => {
              const member = members.find((m:any)=>m.id === e.target.value);
              if(member && setActiveMember){
                setActiveMember(member);
              }
            }}
            className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
          >

            {members.map((member:any)=>(
              <option key={member.id} value={member.id}>
                {member.avatar_emoji || '👤'} {member.name} ({member.role})
              </option>
            ))}

          </select>

        </div>


        <nav className="space-y-1">

          {menuItems.map((item)=>(
            <button
              key={item.id}
              type="button"
              onClick={()=>goTo(item.path,item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                ? 'bg-rose-50 text-rose-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}

        </nav>

      </div>



      <div className="pt-4 border-t border-gray-100 space-y-2">

        <button
          type="button"
          onClick={()=>goTo('/family','family')}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl text-xs shadow-md hover:opacity-90 flex items-center justify-center gap-2"
        >
          ➕ Add Child / Manage Family
        </button>


        {signOut && (
          <button
            type="button"
            onClick={()=>signOut()}
            className="w-full py-2 px-3 text-gray-500 hover:text-rose-600 hover:bg-rose-50 font-medium rounded-xl text-xs"
          >
            🚪 Sign Out
          </button>
        )}

      </div>

    </aside>
  );
}



export function MobileBottomNav({ role }: {role:string}) {
  return null;
}




export function TopBar({
 title,
 subtitle,
 right
}:{
 title:string;
 subtitle?:string;
 right?:React.ReactNode
}){

 const auth = useAuth();

 const activeMember = auth?.activeMember;
 const signOut = auth?.signOut;


 return (

<div className="flex items-center justify-between px-5 py-4 lg:px-8 lg:py-6">

<div>

<h1 className="text-xl lg:text-2xl font-bold text-gray-900">
{title}
</h1>

{subtitle &&
<p className="text-sm text-gray-500 mt-0.5">
{subtitle}
</p>
}

</div>


<div className="flex items-center gap-3">

{right}


{activeMember && (

<div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 border border-gray-200">

<span>{activeMember.avatar_emoji || '👤'}</span>

<span className="text-sm font-semibold text-gray-700">
{activeMember.name}
</span>

</div>

)}


{signOut && (

<button
type="button"
onClick={()=>signOut()}
className="px-3 py-1.5 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 text-gray-600 rounded-lg text-xs font-semibold"
>
Sign Out
</button>

)}

</div>

</div>

 );

}
