
export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20" data-testid="home-page">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">SMS Food Delivery</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Send daily menus via SMS and receive orders with payment links
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg max-w-md">
          <h2 className="text-lg font-semibold mb-3">How it works:</h2>
          <ol className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              Create your daily menu in the admin dashboard
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              Send menu via SMS to your customer list
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              Customers reply with their order
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              They receive a secure payment link
            </li>
          </ol>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/admin"
          >
            Admin Dashboard
          </a>
          <a
            className="rounded-full border border-solid border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/docs"
          >
            View Documentation
          </a>
        </div>
      </main>

      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-500">
        <span>SMS Food Delivery App</span>
        <span>•</span>
        <span>Built with Next.js & Twilio</span>
      </footer>
    </div>
  );
}