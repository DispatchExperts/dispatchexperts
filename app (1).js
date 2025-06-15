const { useState, useEffect } = React;

const LanguageContext = React.createContext();

// Firebase Configuration (Replace with your config)
const firebaseConfig = YOUR_FIREBASE_CONFIG; // e.g., { apiKey: "...", authDomain: "...", etc. }
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// Login Component
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { lang } = React.useContext(LanguageContext);

  const handleLogin = (e) => {
    e.preventDefault();
    auth.signInWithEmailAndPassword(username, password)
      .then((userCredential) => {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.hash = 'admin';
      })
      .catch((error) => {
        setError(lang === 'ur' ? 'غلط صارف نام یا پاس ورڈ' : 'Invalid username or password');
      });
  };

  const handleForgotPassword = () => {
    auth.sendPasswordResetEmail(username)
      .then(() => {
        alert(lang === 'ur' ? 'پاس ورڈ ری سیٹ لنک ای میل کردیا گیا ہے۔' : 'Password reset link sent to your email.');
      })
      .catch((error) => {
        setError(lang === 'ur' ? 'ای میل نہیں ملا۔' : 'Email not found.');
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">{lang === 'ur' ? 'ایڈمن لاگ ان' : 'Admin Login'}</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700">{lang === 'ur' ? 'صارف نام' : 'Username'}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={lang === 'ur' ? 'صارف نام درج کریں' : 'Enter username'}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">{lang === 'ur' ? 'پاس ورڈ' : 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={lang === 'ur' ? 'پاس ورڈ درج کریں' : 'Enter password'}
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            {lang === 'ur' ? 'لاگ ان' : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full mt-2 text-blue-600 hover:underline"
          >
            {lang === 'ur' ? 'پاس ورڈ بھول گئے؟' : 'Forgot Password?'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { lang } = React.useContext(LanguageContext);
  const [users, setUsers] = useState(JSON.parse(localStorage.getItem('users') || '[]'));
  const [loads, setLoads] = useState(JSON.parse(localStorage.getItem('loads') || '[]'));
  const [map, setMap] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        localStorage.removeItem('isLoggedIn');
        window.location.hash = '';
      }
    });

    const mapInstance = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 10,
    });
    setMap(mapInstance);
    new google.maps.Marker({
      position: { lat: 37.7749, lng: -122.4194 },
      map: mapInstance,
      title: "Truck Location",
    });
  }, []);

  const addUser = (name, role = 'admin') => {
    const newUser = { id: Date.now(), name, role };
    setUsers([...users, newUser]);
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
  };

  const addLoad = (details) => {
    const newLoad = { id: Date.now(), ...details, status: 'Pending' };
    setLoads([...loads, newLoad]);
    localStorage.setItem('loads', JSON.stringify([...loads, newLoad]));
  };

  const logout = () => {
    auth.signOut().then(() => {
      localStorage.removeItem('isLoggedIn');
      window.location.hash = '';
    });
  };

  return (
    <div className="min-h-screen bg-gray-200 p-4 sm:p-6">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{lang === 'ur' ? 'ایڈمن پینل' : 'Admin Panel'}</h1>
        <button
          onClick={logout}
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
        >
          {lang === 'ur' ? 'لاگ آؤٹ' : 'Logout'}
        </button>
      </header>
      <div className="max-w-7xl mx-auto mt-6">
        <h2 className="text-3xl font-bold mb-4">{lang === 'ur' ? 'ڈسپیچ مینجمنٹ' : 'Dispatch Management'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'صارف مینجمنٹ' : 'User Management'}</h3>
            <input
              type="text"
              placeholder={lang === 'ur' ? 'صارف کا نام' : 'User Name'}
              className="w-full p-2 mb-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && addUser(e.target.value)}
            />
            <select
              className="w-full p-2 mb-2 border rounded"
              onChange={(e) => addUser(prompt('Enter name'), e.target.value)}
            >
              <option value="admin">{lang === 'ur' ? 'ایڈمن' : 'Admin'}</option>
              <option value="dispatcher">{lang === 'ur' ? 'ڈسپیچر' : 'Dispatcher'}</option>
            </select>
            <ul className="text-gray-600">
              {users.map(user => <li key={user.id}>{user.name} ({user.role})</li>)}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'لوڈ ڈسپیچنگ' : 'Load Dispatching'}</h3>
            <input
              type="text"
              placeholder={lang === 'ur' ? 'لوڈ تفصیلات' : 'Load Details'}
              className="w-full p-2 mb-2 border rounded"
              onKeyPress={(e) => e.key === 'Enter' && addLoad({ details: e.target.value })}
            />
            <ul className="text-gray-600">
              {loads.map(load => <li key={load.id}>{load.details} - {load.status}</li>)}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'رپورٹنگ' : 'Reporting'}</h3>
            <p className="text-gray-600">{lang === 'ur' ? 'مختلف رپورٹس دیکھیں' : 'View various reports'}</p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {lang === 'ur' ? 'رپورٹس دیکھیں' : 'View Reports'}
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow col-span-2">
            <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'ریل ٹائم ٹریکنگ' : 'Real-Time Tracking'}</h3>
            <div id="map" style={{ height: '300px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Website() {
  const [lang, setLang] = useState('en');

  return (
    <LanguageContext.Provider value={{ lang }}>
      <div>
        <header className="bg-blue-600 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold">{lang === 'ur' ? 'سمارٹ ٹرک ڈسپیچنگ حل' : 'Smart Truck Dispatching Solutions'}</h1>
            <div className="flex items-center">
              <label className="mr-2">{lang === 'ur' ? 'اردو' : 'English'}</label>
              <input
                type="checkbox"
                checked={lang === 'ur'}
                onChange={() => setLang(lang === 'en' ? 'ur' : 'en')}
                className="toggle"
              />
            </div>
          </div>
        </header>

        <section className="bg-blue-100 py-24 text-center" style={{ backgroundImage: `url('images/truck.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="bg-black bg-opacity-50 py-12">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-4xl font-bold mb-4 text-white">{lang === 'ur' ? 'اپنے ٹرکنگ منافع کو بڑھائیں' : 'Maximize Your Trucking Profits'}</h2>
              <p className="text-xl mb-6 text-white">{lang === 'ur' ? 'ہم مالکان اور فلیٹ مالکان کو 24/7 مدد اور بہترین لوڈز کے ساتھ مدد کرتے ہیں۔' : 'We help owner-operators and fleet owners with 24/7 support and optimized loads.'}</p>
              <a href="#contact" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
                {lang === 'ur' ? 'شروع کریں' : 'Get Started'}
              </a>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{lang === 'ur' ? 'ہمارے فیچرز' : 'Our Features'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'لوڈ مینجمنٹ' : 'Load Management'}</h3>
                <p>{lang === 'ur' ? 'لوڈز کو موثر طریقے سے بنائیں اور تفویض کریں۔' : 'Efficiently create and assign loads with real-time scheduling.'}</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'ریل ٹائم GPS ٹریکنگ' : 'Real-Time GPS Tracking'}</h3>
                <p>{lang === 'ur' ? 'ٹرکس کو براہ راست ٹریکنگ کریں۔' : 'Track trucks live with geofencing and ETA updates.'}</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'انوائسنگ' : 'Invoicing'}</h3>
                <p>{lang === 'ur' ? 'انوائسز خودکار بنائیں۔' : 'Auto-generate invoices and integrate with QuickBooks.'}</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'AI آٹومیشن' : 'AI Automation'}</h3>
                <p>{lang === 'ur' ? 'لوڈ تفویض کو خودکار کریں۔' : 'Automate load assignments with AI-driven insights.'}</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'لوڈ بورڈ انٹیگریشن' : 'Load Board Integration'}</h3>
                <p>{lang === 'ur' ? 'زیادہ معاوضہ والے فرائٹ تک رسائی۔' : 'Access high-paying freight via DAT or Truckstop.'}</p>
              </div>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'صارف پورٹل' : 'Customer Portal'}</h3>
                <p>{lang === 'ur' ? 'کوٹیشن اور ٹریکنگ کے لیے خودکار پورٹل۔' : 'Self-service portal for quotes and tracking.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="why-us" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{lang === 'ur' ? 'ہم کیوں منتخب کریں' : 'Why Choose Us'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl mb-2">✅</p>
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? '24/7 سپورٹ' : '24/7 Support'}</h3>
                <p>{lang === 'ur' ? 'ہر وقت مدد۔' : 'Real-time assistance anytime you need.'}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl mb-2">🚛</p>
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'لوڈ آپٹیمائزیشن' : 'Load Optimization'}</h3>
                <p>{lang === 'ur' ? 'بہترین لوڈز تیز حاصل کریں۔' : 'We help you get the best-paying loads fast.'}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl mb-2">💼</p>
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'منتخب ایجنٹس' : 'Dedicated Agents'}</h3>
                <p>{lang === 'ur' ? 'تجربہ کار ڈسپیچرز۔' : 'Trained dispatchers with logistics experience.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{lang === 'ur' ? 'ہمارے بارے میں' : 'About Us'}</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">{lang === 'ur' ? 'ڈسپیچ ایکسپرٹس ٹرکرز کے لیے قابل اعتماد ساتھی ہے، جو فلیٹ کو بہتر بنانے اور منافع بڑھانے کے لیے جدید ڈسپیچنگ حل پیش کرتا ہے۔' : 'DispatchExperts is a trusted partner for truckers, offering cutting-edge dispatching solutions to optimize your fleet and boost profits.'}</p>
          </div>
        </section>

        <section id="pricing" className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{lang === 'ur' ? 'قیمتوں کا تعین' : 'Pricing'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'بنیادی' : 'Basic'}</h3>
                <p className="text-2xl mb-4">$50/month</p>
                <ul className="text-gray-600">
                  <li>{lang === 'ur' ? '10 لوڈز' : '10 Loads'}</li>
                  <li>{lang === 'ur' ? 'بنیادی ٹریکنگ' : 'Basic Tracking'}</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'پرو' : 'Pro'}</h3>
                <p className="text-2xl mb-4">$100/month</p>
                <ul className="text-gray-600">
                  <li>{lang === 'ur' ? '50 لوڈز' : '50 Loads'}</li>
                  <li>{lang === 'ur' ? 'ریل ٹائم ٹریکنگ' : 'Real-Time Tracking'}</li>
                  <li>{lang === 'ur' ? 'AI آٹومیشن' : 'AI Automation'}</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <h3 className="text-xl font-semibold mb-2">{lang === 'ur' ? 'انٹرپرائز' : 'Enterprise'}</h3>
                <p className="text-2xl mb-4">{lang === 'ur' ? 'رابطہ کریں' : 'Contact Us'}</p>
                <ul className="text-gray-600">
                  <li>{lang === 'ur' ? 'غیر محدود لوڈز' : 'Unlimited Loads'}</li>
                  <li>{lang === 'ur' ? 'کامل سپورٹ' : 'Full Support'}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{lang === 'ur' ? 'اکثر پوچھے گئے سوالات' : 'Frequently Asked Questions'}</h2>
            <div className="max-w-2xl mx-auto">
              <details className="mb-4">
                <summary className="font-semibold">{lang === 'ur' ? 'ڈسپیچنگ کتنا عرصہ لیتا ہے؟' : 'How long does dispatching take?'}</summary>
                <p className="text-gray-600 mt-2">{lang === 'ur' ? 'عموماً چند گھنٹوں میں۔' : 'Typically within a few hours.'}</p>
              </details>
              <details className="mb-4">
                <summary className="font-semibold">{lang === 'ur' ? 'کیا میرا ڈیٹا محفوظ ہے؟' : 'Is my data secure?'}</summary>
                <p className="text-gray-600 mt-2">{lang === 'ur' ? 'ہاں، ہم اعلیٰ سیکیورٹی استعمال کرتے ہیں۔' : 'Yes, we use high-level security.'}</p>
              </details>
            </div>
          </div>
        </section>

        <section id="contact" className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">{lang === 'ur' ? 'ہم سے رابطہ کریں' : 'Contact Us'}</h2>
            <div className="max-w-lg mx-auto">
              <form action="https://formspree.io/f/YOUR_FORMSPREE_ID" method="POST" className="grid grid-cols-1 gap-4">
                <input type="text" name="name" placeholder={lang === 'ur' ? 'نام' : 'Name'} className="p-3 border rounded w-full" />
                <input type="email" name="email" placeholder={lang === 'ur' ? 'ای میل' : 'Email'} className="p-3 border rounded w-full" />
                <textarea name="message" placeholder={lang === 'ur' ? 'پیغام' : 'Message'} className="p-3 border rounded w-full h-32"></textarea>
                <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
                  {lang === 'ur' ? 'پیغام بھیجیں' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer className="bg-blue-600 text-white py-6 text-center">
          <p>© 2025 DispatchExperts. All rights reserved.</p>
        </footer>
      </div>
    </LanguageContext.Provider>
  );
}

function App() {
  const [view, setView] = useState(() => {
    return auth.currentUser ? 'admin' : (window.location.hash === '#admin' ? 'login' : 'website');
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setView(user ? 'admin' : (window.location.hash === '#admin' ? 'login' : 'website'));
    });
    return () => unsubscribe();
  }, []);

  return view === 'login' ? <Login /> : (view === 'admin' ? <AdminDashboard /> : <Website />);
}

ReactDOM.render(<App />, document.getElementById('root'));