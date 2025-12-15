export default function AboutPage() {
    return (
      <div className="container mx-auto px-4 py-20 lg:py-32 max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About Flash</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-xl text-muted-foreground leading-relaxed">
            Flash is a premium ecommerce experience designed for speed and style. 
            We believe shopping should be instantaneous, beautiful, and effortless.
          </p>
          <div className="grid gap-8 mt-12">
              <div className="p-6 rounded-2xl border bg-muted/20">
                  <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                  <p className="text-muted-foreground">To redefine digital retail with cutting-edge technology and stunning design.</p>
              </div>
              <div className="p-6 rounded-2xl border bg-muted/20">
                  <h3 className="text-xl font-semibold mb-2">Quality First</h3>
                  <p className="text-muted-foreground">Every product is curated for excellence. If it's on Flash, it's the best.</p>
              </div>
          </div>
        </div>
      </div>
    )
  }
