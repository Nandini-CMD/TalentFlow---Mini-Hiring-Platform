import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Briefcase, Target, Clock, CheckCircle } from "lucide-react";

export default function Analytics() {
  // Mock analytics data
  const stats = {
    totalJobs: 25,
    activeJobs: 18,
    totalCandidates: 1247,
    newCandidatesThisWeek: 42,
    totalAssessments: 8,
    assessmentCompletion: 78,
    averageTimeToHire: 21,
    offerAcceptanceRate: 85
  };

  const recentActivity = [
    { type: "application", candidate: "Sarah Johnson", job: "Senior Frontend Developer", time: "2 hours ago" },
    { type: "interview", candidate: "Michael Chen", job: "UX Designer", time: "4 hours ago" },
    { type: "offer", candidate: "Emily Rodriguez", job: "Product Manager", time: "1 day ago" },
    { type: "hire", candidate: "David Kim", job: "Backend Developer", time: "2 days ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Track your hiring performance and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeJobs} active</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCandidates.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.newCandidatesThisWeek}</span> this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assessment Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assessmentCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 text-green-600 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTimeToHire} days</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-3 days</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
            <CardDescription>Current month performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Applications Received</span>
              <span className="font-semibold">324</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Candidates Screened</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interviews Conducted</span>
              <span className="font-semibold">78</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Offers Extended</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Hires Made</span>
              <span className="font-semibold text-green-600">18</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest hiring pipeline updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === "application" ? "bg-blue-500" :
                  activity.type === "interview" ? "bg-yellow-500" :
                  activity.type === "offer" ? "bg-orange-500" :
                  "bg-green-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    <span className="font-medium">{activity.candidate}</span>
                    {activity.type === "application" && " applied for "}
                    {activity.type === "interview" && " interviewed for "}
                    {activity.type === "offer" && " received offer for "}
                    {activity.type === "hire" && " was hired for "}
                    <span className="text-muted-foreground">{activity.job}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>Monthly targets and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Offer Acceptance Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.offerAcceptanceRate}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Quality of Hire</p>
                <p className="text-2xl font-bold text-blue-600">4.2/5</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Source Effectiveness</p>
                <p className="text-2xl font-bold text-purple-600">73%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}