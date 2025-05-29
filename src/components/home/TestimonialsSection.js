import { useRatioPrioritization } from '@/hooks/useRatioPrioritization';

export default function TestimonialsSection() {
  const initialTestimonials = [
    {
      id: "testimonial-1",
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp",
      content: "This app has completely transformed how we track our field team. The real-time updates are a game changer!",
      avatar: "/avatars/sarah.jpg"
    },
    {
      id: "testimonial-2",
      name: "Michael Chen",
      role: "Operations Manager",
      company: "Logistics Pro",
      content: "The analytics dashboard gives me insights I never had before. I can make better decisions faster.",
      avatar: "/avatars/michael.jpg"
    },
    {
      id: "testimonial-3",
      name: "Jessica Williams",
      role: "Small Business Owner",
      company: "Urban Delivery",
      content: "Setup was incredibly easy and my delivery team was up and running in minutes. Customer support is excellent too!",
      avatar: "/avatars/jessica.jpg"
    }
  ];
  
  // Use the ratio prioritization hook with a 5% threshold
  const { prioritizedItems: testimonials, recordInteraction } = useRatioPrioritization(
    initialTestimonials, 
    'testimonial', 
    0.05, 
    [] // No fixed testimonials
  );

  return (
    <section id="testimonials" className="py-16 bg-foreground/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-background p-6 rounded-lg shadow-md"
              data-analytics-id={testimonial.id}
              onClick={() => recordInteraction(testimonial.id)}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-foreground/10 mr-4"></div>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-foreground/70">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
              <p className="italic">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


