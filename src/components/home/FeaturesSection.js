export default function FeaturesSection() {
  const features = [
    {
      title: "Easy Sign Up",
      description: "Create an account in seconds with just your basic information.",
      icon: "👤"
    },
    {
      title: "Location Based",
      description: "Tell us your city and state to get personalized experiences.",
      icon: "📍"
    },
    {
      title: "Secure Access",
      description: "Your data is encrypted and securely stored in our database.",
      icon: "🔒"
    },
    {
      title: "Real-time Updates",
      description: "Get instant notifications about important events.",
      icon: "🔔"
    },
    {
      title: "Data Analytics",
      description: "View detailed reports and analytics about your usage.",
      icon: "📊"
    },
    {
      title: "Cross-platform",
      description: "Access your account from any device, anywhere.",
      icon: "📱"
    }
  ];

  return (
    <section id="features" className="py-20 bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Powerful Features</h2>
          <p className="mt-4 text-xl text-foreground/70 max-w-3xl mx-auto">
            Everything you need to track and manage your location data in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 bg-background rounded-lg shadow-sm border border-foreground/10 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mb-4 bg-foreground/10 rounded-full flex items-center justify-center text-2xl">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
