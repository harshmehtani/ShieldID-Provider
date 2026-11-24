import React, { useState } from 'react'
import { Bell, CheckCircle, Trash } from '@phosphor-icons/react'
import { useApp } from '@/context/AppContext'
import { formatDateTime } from '@/lib/dates'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { EmptyState } from '@/components/common/EmptyState'

export const NotificationsPage: React.FC = () => {
  const { state, currentUser, markNotificationRead, markAllNotificationsRead } = useApp()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  if (!currentUser) return null

  const userNotifications = state.notifications.filter(
    (n) => n.userId === currentUser.id || !n.userId,
  )

  const displayed = userNotifications.filter((n) => (filter === 'unread' ? !n.read : true))
  const unreadCount = userNotifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            System Notifications
          </h1>
          <p className="text-sm text-slate-500">
            Lifecycle alerts, credential events, and administrative updates
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllNotificationsRead}
            icon={<CheckCircle weight="fill" className="w-4 h-4 text-emerald-600" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Notifications ({userNotifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#2563EB] text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <EmptyState
          icon={<Bell weight="fill" className="w-6 h-6 text-slate-400" />}
          title="No notifications"
          description={
            filter === 'unread'
              ? 'All notifications have been marked as read.'
              : 'There are no notifications in your inbox.'
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {displayed.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50/80 ${
                !n.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2 rounded-md shrink-0 mt-0.5 ${
                    !n.read ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Bell weight="fill" className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                      {n.title}
                    </h4>
                    {!n.read && <Badge variant="blue">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.body}</p>
                  <span className="text-[11px] text-slate-400 mt-1.5 block font-mono">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    markNotificationRead(n.id)
                  }}
                  className="text-xs text-blue-600 hover:underline shrink-0 font-medium"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
