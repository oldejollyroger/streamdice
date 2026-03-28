// app.js - MINIMAL TEST VERSION

const App = () => {
  const [userRegion, setUserRegion] = React.useState(null);
  const [showRegionSelector, setShowRegionSelector] = React.useState(true);

  const handleRegionChange = (region) => {
    setUserRegion(region);
    setShowRegionSelector(false);
    console.log('Region selected:', region);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">StreamDice Test</h1>
        <p className="text-gray-400">Region: {userRegion || 'Not set'}</p>
      </header>

      {/* Test Content */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl text-white mb-4">Quick Filters Test</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-full">Action</button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-full">Comedy</button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-full">Sci-Fi</button>
        </div>
      </div>

      {/* Surprise Me Button */}
      <div className="flex justify-center mb-6">
        <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full text-lg">
          🎲 Surprise Me!
        </button>
      </div>

      {/* Welcome Message */}
      <div className="text-center py-16">
        <p className="text-xl text-gray-400">Click "Surprise Me" to discover a movie!</p>
      </div>

      {/* Region Selector Modal */}
      {showRegionSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-gray-900 border border-gray-700 p-6 rounded-xl text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Select Your Region</h1>
            <select 
              onChange={(e) => handleRegionChange(e.target.value)} 
              defaultValue=""
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="" disabled>-- Choose Region --</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="ES">Spain</option>
              <option value="MX">Mexico</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple render without ToastProvider
const AppWithProviders = () => {
  return React.createElement(App);
};