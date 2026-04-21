import { FaCreditCard, FaPaypal, FaUniversity } from "react-icons/fa";

const Funding = () => {
  const handleDonate = () => {
    // In a real app, you'd handle the authentication check and payment processing here.
    // For this example, we'll just show an alert.
    alert("Thank you for your donation!");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Support Our Mission
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Your contribution helps us connect donors with those in need, saving
            lives every day.
          </p>
        </div>

        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Choose Your Donation Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl hover:bg-red-100 transition-all duration-300 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-red-500">
              <FaCreditCard className="text-4xl text-red-600 mb-2" />
              <span className="font-semibold text-gray-700">
                Credit/Debit Card
              </span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500">
              <FaPaypal className="text-4xl text-blue-700 mb-2" />
              <span className="font-semibold text-gray-700">PayPal</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-300 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-green-500">
              <FaUniversity className="text-4xl text-green-600 mb-2" />
              <span className="font-semibold text-gray-700">Bank Transfer</span>
            </button>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Amount (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                name="amount"
                id="amount"
                className="w-full pl-7 pr-12 py-3 border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-lg"
                placeholder="0.00"
                aria-describedby="price-currency"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm" id="price-currency">
                  USD
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleDonate}
              className="w-full bg-red-600 text-white py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105"
            >
              Donate Now
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            How Your Donation Helps
          </h3>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Every dollar you donate goes towards maintaining our platform,
            organizing blood drives, and providing logistical support for urgent
            blood requests. You are a vital part of our life-saving community.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Funding;
