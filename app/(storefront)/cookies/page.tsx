export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen prose prose-zinc dark:prose-invert">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">
        Cookies Policy
      </h1>
      <p className="text-muted-foreground">Last updated: February 13, 2026</p>

      <section className="mt-12 space-y-6">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          1. What Are Cookies
        </h2>
        <p>
          Cookies are small pieces of text sent to your web browser by a website
          you visit. A cookie file is stored in your web browser and allows the
          Service or a third-party to recognize you and make your next visit
          easier and the Service more useful to you.
        </p>

        <h2 className="text-2xl font-bold uppercase tracking-tight">
          2. How FLASH Uses Cookies
        </h2>
        <p>
          When you use and access the Service, we may place a number of cookies
          files in your web browser. We use cookies for the following purposes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            To enable certain functions of the Service (like your shopping bag)
          </li>
          <li>To provide analytics (Google Analytics)</li>
          <li>To store your preferences</li>
        </ul>

        <h2 className="text-2xl font-bold uppercase tracking-tight">
          3. Your Choices
        </h2>
        <p>
          If you&apos;d like to delete cookies or instruct your web browser to
          delete or refuse cookies, please visit the help pages of your web
          browser. Please note, however, that if you delete cookies or refuse to
          accept them, you might not be able to use all of the features we
          offer.
        </p>
      </section>
    </div>
  );
}
