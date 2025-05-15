import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../config/supabase";

const Chat = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fonction de recherche
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, avatar_url')
          .ilike('username', `%${searchQuery}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#1e293b] border-r border-gray-700">
        {/* Barre de recherche */}
        <div className="px-4 pb-4 pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2a3447] text-gray-200 rounded-md py-2 pl-4 pr-10 focus:outline-none"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 h-5 w-5" />
          </div>

          {/* Résultats de recherche */}
          {searchQuery && (
            <div className="absolute z-10 w-[calc(25%-2rem)] mt-1 bg-[#2a3447] rounded-md shadow-lg max-h-60 overflow-auto">
              {isSearching ? (
                <div className="p-2 text-center text-gray-400">Recherche...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map((user) => (
                    <li 
                      key={user.id}
                      className="p-2 hover:bg-[#3a4457] cursor-pointer flex items-center"
                      onClick={() => {
                        // Ouvrir une conversation avec cet utilisateur
                        console.log("Démarrer chat avec:", user.username);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <img 
                        src={user.avatar_url || '/default-avatar.png'} 
                        alt={user.username}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm">{user.username}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-2 text-center text-gray-400 text-sm">
                  Aucun résultat
                </div>
              )}
            </div>
          )}
        </div>

        {/* Liste des conversations existantes */}
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {/* ... votre code existant pour les conversations ... */}
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 bg-[#0f172a]">
        {/* ... votre code existant pour le chat ... */}
      </div>
    </div>
  );
};

export default Chat;