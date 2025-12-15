export default function PrivacyPage() {
    return (
      <div className="container mx-auto px-4 py-20 lg:py-32 max-w-4xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-sm dark:prose-invert text-muted-foreground">
          <p>Last Updated: December 2025</p>
          <p>
            Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information when you use Flash.
          </p>
          
          <h2 className="text-foreground mt-8 text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter.
          </p>

          <h2 className="text-foreground mt-8 text-xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We use your information to process transactions, provide customer support, and improve our services. We do not sell your personal data.
          </p>

           <h2 className="text-foreground mt-8 text-xl font-semibold">3. Security</h2>
          <p>
            We implement industry-standard security measures to protect your data. All payments are processed via secure, PCI-compliant gateways.
          </p>

           <h2 className="text-foreground mt-8 text-xl font-semibold">4. Contact Us</h2>
          <p>
            If you have any questions about this policy, please contact us at support@flash.com.
          </p>
        </div>
      </div>
    )
  }
