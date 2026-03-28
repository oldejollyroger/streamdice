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

    Replace the region selector code with this (no t references):

{/* Region Selector Modal - FIXED */}
{(showRegionSelector || !userRegion) && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  }}>
    <div style={{
      width: '100%',
      maxWidth: '400px',
      backgroundColor: '#1f2937',
      border: '1px solid #374151',
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: '1.5rem'
      }}>
        Select Your Region
      </h1>
      {availableRegions.length > 0 ? (
        <select 
          onChange={(e) => handleRegionChange(e.target.value)} 
          defaultValue=""
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#374151',
            border: '1px solid #4b5563',
            borderRadius: '0.5rem',
            color: '#ffffff',
            fontSize: '1rem'
          }}
        >
          <option value="" disabled>-- Select Region --</option>
          {availableRegions.map(region => (
            <option key={region.iso_3166_1} value={region.iso_3166_1}>
              {region.english_name}
            </option>
          ))}
        </select>
      ) : (
        <span className="loader"></span>
      )}
    </div>
  </div>
)}
    </div>
  );
};

// Render the app
ReactDOM.render(<AppWithProviders />, document.getElementById('root'));

// Simple renders without ToastProvider
const AppWithProviders = () => {
  return React.createElement(App);
};