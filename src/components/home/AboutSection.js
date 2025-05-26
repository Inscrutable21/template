export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">About Us</h2>
            <p className="mt-4 text-lg text-foreground/80">
              We started MyApp with a simple mission: to make location tracking accessible, 
              secure, and useful for everyone. Our team of dedicated professionals works 
              tirelessly to ensure that our platform meets the highest standards of quality 
              and security.
            </p>
            <p className="mt-4 text-lg text-foreground/80">
              Founded in 2023, we've quickly grown to serve thousands of users worldwide. 
              Our commitment to innovation and user privacy has made us a trusted name in 
              the industry.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-foreground/70">Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">150+</p>
                <p className="text-foreground/70">Countries</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">99.9%</p>
                <p className="text-foreground/70">Uptime</p>
              </div>
            </div>
          </div>
          <div className="order-first md:order-last">
            <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-lg p-8 shadow-xl">
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-foreground/10 rounded-md"></div>
                <div className="h-6 w-5/6 bg-foreground/10 rounded-md"></div>
                <div className="h-6 w-2/3 bg-foreground/10 rounded-md"></div>
                <div className="h-6 w-4/5 bg-foreground/10 rounded-md"></div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="h-24 bg-foreground/10 rounded-md"></div>
                <div className="h-24 bg-foreground/10 rounded-md"></div>
              </div>
              <div className="mt-4 h-32 bg-foreground/10 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
