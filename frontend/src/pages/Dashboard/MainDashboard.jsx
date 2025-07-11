// export default MainDashboard;
import React from "react";

const MainDashboard = () => {
  // Sample data
  const stats = [
    { title: "Total Users", value: "2,456", change: "+12%", trend: "up" },
    { title: "Revenue", value: "$4,598", change: "+8%", trend: "up" },
    { title: "Pending", value: "23", change: "-4%", trend: "down" },
    { title: "Tasks", value: "154", change: "+19%", trend: "up" },
  ];

  const recentActivities = [
    { user: "John Doe", action: "Completed project", time: "2 mins ago" },
    { user: "Jane Smith", action: "Submitted report", time: "1 hour ago" },
    { user: "Bob Johnson", action: "Updated profile", time: "3 hours ago" },
    { user: "Alice Williams", action: "Created task", time: "5 hours ago" },
  ];

  const projects = [
    { name: "Website Redesign", progress: 80, team: ["J", "A", "B"] },
    { name: "Mobile App", progress: 45, team: ["M", "S"] },
    { name: "Dashboard UI", progress: 100, team: ["D", "K", "L"] },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === "up"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {activity.user.charAt(0)}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-800">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Projects</h2>
          <div className="space-y-6">
            {projects.map((project, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-800">{project.name}</h3>
                  <span className="text-xs text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.progress === 100
                        ? "bg-green-500"
                        : project.progress > 50
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex -space-x-2">
                    {project.team.map((member, i) => (
                      <div
                        key={i}
                        className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-800"
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                  <button className="ml-auto text-xs text-gray-500 hover:text-gray-700">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Performance</h2>
          <select className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        <div className="h-64 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
          Chart Area (would be replaced with a real chart library)
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
