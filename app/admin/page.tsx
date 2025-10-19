import { createClient } from '@/lib/supabase/server'
import { FileText, Video, Users, Star, Clock, TrendingUp, CheckCircle2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Calculate date for "this week"
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Fetch comprehensive stats in parallel
  const [
    { count: pendingCount },
    { count: approvedCount },
    { count: totalVideos },
    { count: totalCreators },
    { count: totalRatings },
    { count: newThisWeek },
    { data: recentVideos },
    { data: recentRatings },
  ] = await Promise.all([
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('creators').select('*', { count: 'exact', head: true }),
    supabase.from('ratings').select('*', { count: 'exact', head: true }),
    supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString()),
    supabase
      .from('videos')
      .select('id, title, status, created_at, creator:creators(name)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('ratings')
      .select('id, rating, created_at, video:videos(title), user:user_id')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Get total users (from auth.users - this needs admin privileges)
  // For now, we'll estimate or skip if we don&apos;t have service role access

  const stats = [
    {
      name: 'Pending Submissions',
      value: pendingCount || 0,
      icon: FileText,
      color: 'text-amber',
      bgColor: 'bg-amber/10',
      borderColor: 'border-amber',
      highlighted: true,
      description: 'Awaiting review',
    },
    {
      name: 'Approved Videos',
      value: approvedCount || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500',
      description: 'Live on site',
    },
    {
      name: 'Total Videos',
      value: totalVideos || 0,
      icon: Video,
      color: 'text-crimson',
      bgColor: 'bg-crimson/10',
      borderColor: 'border-crimson',
      description: 'All time',
    },
    {
      name: 'Total Creators',
      value: totalCreators || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary',
      description: 'Contributors',
    },
    {
      name: 'Total Ratings',
      value: totalRatings || 0,
      icon: Star,
      color: 'text-amber',
      bgColor: 'bg-amber/10',
      borderColor: 'border-amber',
      description: 'Community feedback',
    },
    {
      name: 'New This Week',
      value: newThisWeek || 0,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500',
      description: 'Last 7 days',
    },
  ]

  // Combine and sort recent activity
  const recentActivity = [
    ...(recentVideos || []).map((video: { id: string; title: string; status: string; created_at: string; creator: { name: string }[] | null }) => ({
      type: 'video' as const,
      action: video.status === 'pending' ? 'submitted' : 'approved',
      title: video.title,
      creator: video.creator?.[0]?.name,
      timestamp: video.created_at,
      status: video.status,
    })),
    ...(recentRatings || []).map((rating: { id: string; rating: number; created_at: string; video: { title: string }[] | null }) => ({
      type: 'rating' as const,
      action: 'rated',
      title: rating.video?.[0]?.title,
      rating: rating.rating,
      timestamp: rating.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient-cinema">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your platform&apos;s performance and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className={`bg-card border-2 ${
                stat.highlighted ? stat.borderColor : 'border-border'
              } rounded-xl p-6 hover:shadow-lg transition-all ${
                stat.highlighted ? 'ring-2 ring-amber/20' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{stat.name}</p>
                  <p className="text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline - Takes 2 columns */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
              <p className="text-sm text-muted-foreground">Last 20 actions on the platform</p>
            </div>
            <Clock className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'video'
                        ? ('status' in activity && activity.status === 'pending')
                          ? 'bg-amber/10'
                          : 'bg-green-500/10'
                        : 'bg-blue-500/10'
                    }`}
                  >
                    {activity.type === 'video' ? (
                      <Video
                        className={`w-5 h-5 ${
                          ('status' in activity && activity.status === 'pending') ? 'text-amber' : 'text-green-500'
                        }`}
                      />
                    ) : (
                      <Star className="w-5 h-5 text-blue-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {activity.type === 'video' ? (
                          <p className="text-sm text-foreground">
                            <span className="font-semibold">{'creator' in activity ? activity.creator : 'Unknown'}</span>{' '}
                            <span className="text-muted-foreground">{activity.action}</span>{' '}
                            <span className="font-medium">&ldquo;{activity.title}&rdquo;</span>
                          </p>
                        ) : (
                          <p className="text-sm text-foreground">
                            <span className="text-muted-foreground">User rated</span>{' '}
                            <span className="font-medium">&ldquo;{activity.title}&rdquo;</span>{' '}
                            <span className="font-semibold text-amber">{'rating' in activity ? activity.rating : 0}★</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {activity.type === 'video' && 'status' in activity && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                            activity.status === 'pending'
                              ? 'bg-amber/10 text-amber'
                              : 'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/admin/submissions"
                className="block p-4 rounded-lg border-2 border-border hover:border-amber hover:bg-amber/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center group-hover:bg-amber/20 transition-colors">
                    <FileText className="w-5 h-5 text-amber" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-amber transition-colors">
                      Review Submissions
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {pendingCount} pending
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="/admin/videos"
                className="block p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Manage Videos
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {totalVideos} total
                    </p>
                  </div>
                </div>
              </a>

              <a
                href="/admin/creators"
                className="block p-4 rounded-lg border-2 border-border hover:border-crimson hover:bg-crimson/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-crimson/10 flex items-center justify-center group-hover:bg-crimson/20 transition-colors">
                    <Users className="w-5 h-5 text-crimson" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-crimson transition-colors">
                      Manage Creators
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {totalCreators} creators
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Platform Health Card */}
          <div className="bg-gradient-to-br from-crimson/10 to-amber/10 border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Platform Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Approval Rate</span>
                <span className="text-sm font-semibold text-foreground">
                  {(totalVideos || 0) > 0
                    ? Math.round(((approvedCount || 0) / (totalVideos || 1)) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Queue</span>
                <span className="text-sm font-semibold text-foreground">{pendingCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Ratings/Video</span>
                <span className="text-sm font-semibold text-foreground">
                  {(approvedCount || 0) > 0
                    ? ((totalRatings || 0) / (approvedCount || 1)).toFixed(1)
                    : '0.0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
