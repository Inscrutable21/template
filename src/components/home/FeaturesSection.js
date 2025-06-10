import { usePersonalization } from '@/hooks/usePersonalization';

export default function FeaturesSection() {
  const initialFeatures = [
    {
      title: "Easy Sign Up",
      description: "Create an account in seconds with just your basic information.",
      icon: "👤",
      id: "easy-sign-up"
    },
    {
      title: "Location Based",
      description: "Tell us your city and state to get personalized experiences.",
      icon: "📍",
      id: "location-based"
    },
    {
      title: "Secure Access",
      description: "Your data is encrypted and securely stored in our database.",
      icon: "🔒",
      id: "secure-access"
    },
    {
      title: "Real-time Updates",
      description: "Get instant notifications about important events.",
      icon: "🔔",
      id: "real-time-updates"
    },
    {
      title: "Data Analytics",
      description: "View detailed reports and analytics about your usage.",
      icon: "📊",
      id: "data-analytics"
    },
    {
      title: "Cross-platform",
      description: "Access your account from any device, anywhere.",
      icon: "📱",
      id: "cross-platform"
    }
  ];
  
  // Replace the useRatioPrioritization hook with usePersonalization
  const { recommendations } = usePersonalization();
  
  // Use all features by default
  const features = initialFeatures;
  
  // Function to record interaction (can be empty or implement analytics)
  const recordInteraction = (id) => {
    // You could implement analytics tracking here if needed
    console.log(`Interaction with feature: ${id}`);
  };
  
  return (
    <section id="features" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              data-feature={feature.title}
              data-analytics-id={`feature-${feature.id}`}
              onClick={() => recordInteraction(feature.id)}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
