"use client";

import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    profilePicture: null,
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleFileChange = (e) => {
	const file = e.target.files[0];
	if (file) {
	  setFormData((prevState) => ({
		...prevState,
		profilePicture: file,
	  }));
  
	  // Créer un URL pour l'aperçu
	  const reader = new FileReader();
	  reader.onloadend = () => {
		setPreviewImage(reader.result);
	  };
	  reader.readAsDataURL(file);
	} else {
	  setPreviewImage(null); // Réinitialiser si aucun fichier n'est sélectionné
	}
  };
  

  const nextStep = () => {
    setStep(step + 1);
    setError("");
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const formDataToSend = new FormData();
      
      // Append all form data to FormData object
      Object.keys(formData).forEach(key => {
        if (key === "profilePicture" && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(`${API_URL}/auth/register`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to chat dashboard
      navigate("/chat");
    } catch (err) {
      setError(
        err.response?.data?.message || "Inscription échouée. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-400 to-green-600">
      {/* Left sidebar with illustration */}
      <div className="hidden md:flex md:w-1/3 lg:w-3/6 flex-col p-10 text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">SoussTalk</h1>
          <p className="text-sm opacity-80">
            Messagerie intelligente et sécurisée
          </p>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <img
            src="/images/chat-illustration.png"
            alt="SoussTalk Illustration"
            className="max-w-full h-auto"
          />
        </div>

        <div className="mt-auto text-sm opacity-70">
          © {new Date().getFullYear()} SoussTalk. Développé par les étudiants de l'ENSIASD
        </div>
      </div>

      {/* Right side with signup form */}
      <div className="w-full md:w-2/3 lg:w-3/5 bg-white rounded-l-3xl shadow-xl flex items-center justify-center p-6 my-5">
        <div className="w-full max-w-md">
          {/* Mobile logo - only visible on small screens */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600">SoussTalk</h1>
            <p className="text-sm text-gray-500">
              Messagerie intelligente et sécurisée
            </p>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Inscription</h2>
            <p className="text-gray-600 mt-2">
              Rejoignez la communauté SoussTalk.
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${i <= step ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

			
            {/* Step 1: Profile Info */}
			{step === 1 && (
  <div className="space-y-6">
    <div className="flex flex-col items-center">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Photo de profil (optionnel)
      </label>
      
      {/* Conteneur de l'aperçu */}
      <div className="relative group">
        <input
          id="profilePicture"
          name="profilePicture"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
		  
        />
        
        {/* Aperçu circulaire */}
        <label 
          htmlFor="profilePicture"
          className={`flex items-center justify-center cursor-pointer ${previewImage ? '' : 'border-2 border-dashed border-gray-300 hover:border-green-500'} rounded-full overflow-hidden transition-all duration-200`}
          style={{
            width: '120px',
            height: '120px',
            background: previewImage ? `url(${previewImage}) center/cover` : '#f3f4f6'
          }}
        >
          {!previewImage && (
            <div className="text-center p-4">
              <svg
                className="mx-auto h-8 w-8 text-gray-400 group-hover:text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="mt-2 block text-xs text-gray-500 group-hover:text-green-600">
                Ajouter une photo
              </span>
            </div>
          )}
        </label>
        
        {/* Bouton pour changer si image déjà sélectionnée */}
        {previewImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200">
            <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity duration-200">
              Changer
            </span>
          </div>
        )}
      </div>
      
      {/* Indication format fichier */}
      <p className="mt-2 text-xs text-gray-500">
        PNG, JPG (max. 2MB)
      </p>
    </div>





                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Votre prénom"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Votre nom"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom d'utilisateur
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Nom d'utilisateur unique"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Suivant <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Numéro de téléphone (optionnel)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="+212 6 00 00 00 00"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bio (optionnel)
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Parlez-nous un peu de vous..."
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Homme</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Femme</span>
                    </label>
                   
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Suivant <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength="8"
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Le mot de passe doit contenir au moins 8 caractères.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? "Inscription en cours..." : "S'inscrire"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte?{" "}
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-500"
              >
                Se connecter
              </Link>
			 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}