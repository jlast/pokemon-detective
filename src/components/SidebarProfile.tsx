interface SidebarProfileProps {
  name: string
  streak?: number
  onLogout: () => void
}

export function SidebarProfile({ name, streak, onLogout }: SidebarProfileProps) {
  const showStreak = streak != null && streak > 0
  const streakLabel = streak === 1 ? '1 day streak' : `${streak} day streak`

  return (
    <div className="sidebar-profile">
      <div className="sidebar-profile__divider" />

      <div className="sidebar-profile__identity">
        <div className="sidebar-profile__avatar">
          <svg viewBox="0 0 44 44" role="img" aria-label="Detective profile">
            <circle cx="22" cy="22" r="21" fill="#f4d35e" />
            <path d="M13.5 16.5 16 9.5h12l2.5 7H13.5Z" fill="#7a5531" />
            <path d="M17 9.5h10l1 3H16l1-3Z" fill="#9b6b3d" />
            <path d="M8.5 17.8c4.8-2 22.2-2 27 0" fill="none" stroke="#51361f" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M14.5 21.5c1.5-2.4 4-3.8 7.5-3.8s6 1.4 7.5 3.8v7.2c0 4.2-3 7.3-7.5 7.3s-7.5-3.1-7.5-7.3v-7.2Z" fill="#f1c08c" />
            <path d="M14.5 21.5h15v3.3c-4.6-.8-10.4-.8-15 0v-3.3Z" fill="#51361f" opacity="0.22" />
            <path d="M11.5 37c1.3-5.1 5.1-8 10.5-8s9.2 2.9 10.5 8H11.5Z" fill="#203250" />
            <path d="M17 37v-6l5 3.3L27 31v6H17Z" fill="#efe2ca" />
            <path d="M14.7 37c.7-3 2.2-5.1 4.5-6.3L22 37h-7.3Z" fill="#8b6138" />
            <path d="M29.3 37c-.7-3-2.2-5.1-4.5-6.3L22 37h7.3Z" fill="#8b6138" />
            <circle cx="18.2" cy="25.5" r="1.1" fill="#203250" />
            <circle cx="25.8" cy="25.5" r="1.1" fill="#203250" />
            <path d="M19.3 31c1.6 1 3.8 1 5.4 0" fill="none" stroke="#8a4f35" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="29.2" cy="26.5" r="3.6" fill="none" stroke="#203250" strokeWidth="1.8" />
            <path d="m31.7 29.2 3.3 3.3" stroke="#203250" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="sidebar-profile__details">
          <strong className="sidebar-profile__name">{name}</strong>
          <span className="sidebar-profile__role">Detective</span>
          {showStreak ? (
            <span className="sidebar-profile__streak">
              <span aria-hidden="true">🔥</span>
              {streakLabel}
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        className="sidebar-profile__logout"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  )
}
