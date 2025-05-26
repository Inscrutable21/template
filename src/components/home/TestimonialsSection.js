export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "This app has completely changed how I track my location data. It's intuitive and powerful!",
      author: "Sarah Johnson",
      role: "Marketing Director",
      initial: "S"
    },
    {
      quote: "I've tried many location tracking apps, but this one stands out for its simplicity and effectiveness.",
      author: "Michael Chen",
      role: "Software Engineer",
      initial: "M"
    },
    {
      quote: "The security features give me peace of mind knowing my location data is protected.",
      author: "Emma Rodriguez",
      role: "Travel Blogger",
      initial: "E"
    }
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">What Our Users Say</h2>
          <p className="mt-4 text-xl text-foreground/70 max-w-3xl mx-auto">
            Don't just take our word for it - hear from some of our satisfied users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="p-6 bg-foreground/5 rounded-lg border border-foreground/10"
            >
              <div className="flex items-center mb-4">
                <div className="mr-4 w-12 h-12 rounded-full bg-gradient-to-br from-foreground/20 to-foreground/10 flex items-center justify-center text-lg font-medium">
                  {testimonial.initial}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-foreground/70">{testimonial.role}</p>
                </div>
              </div>
              <p className="italic text-foreground/80">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
