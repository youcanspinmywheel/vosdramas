let toastTimeout = null;

function hideToast() {
  const toast = document.getElementById('copy-toast');
  toast.classList.remove('show');
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
}

function showToast(message, duration = 1500) {
  // Fermer la popup précédente si elle existe
  hideToast();
  
  const toast = document.getElementById('copy-toast');
  const messageElement = toast.querySelector('.toast-message');
  
  // Mettre à jour le message
  messageElement.textContent = message;
  
  // Afficher le toast
  toast.classList.add('show');
  
  // Programmer la fermeture automatique
  toastTimeout = setTimeout(() => {
    hideToast();
  }, duration);
}

// Modal d'Accueil
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('intro-modal').classList.add('show');
  }, 60);
});

// Ferme le modal quand on clique sur le bouton
document.getElementById('intro-close').addEventListener('click', () => {
  document.getElementById('intro-modal').classList.remove('show');
});

// Stockage des JSONs (sera chargé dynamiquement)
const ornementsData = {};

// Fonction pour charger les données JSON
async function loadOrnementData(id) {
  try {
    const response = await fetch(`data/${id}.json`);
    if (!response.ok) {
      console.warn(`Fichier data/${id}.json non trouvé`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors du chargement de ${id}:`, error);
    return null;
  }
}

// Initialisation des ornements
async function initOrnements() {
  const ornements = document.querySelectorAll('.ornement');
  
  // Charger toutes les données en parallèle
  const loadPromises = Array.from(ornements).map(async (ornement) => {
    const id = ornement.dataset.jsonId;
    const data = await loadOrnementData(id);
    
    if (data) {
      ornementsData[id] = data;
      
      // Vérifier si wheelData existe et n'est pas vide
      const hasWheelData = data.wheelData && data.wheelData.options && data.wheelData.options.length > 0;
      
      // Tous les ornements sont cliquables
      ornement.addEventListener('click', (e) => {
        ornement.classList.add('clicked');
        setTimeout(() => ornement.classList.remove('clicked'), 350);

        if (hasWheelData) {
          // ✅ SI IL Y A DES DONNÉES → copier et message de succès
          const jsonData = JSON.stringify(data.wheelData);

          navigator.clipboard.writeText(jsonData)
            .then(() => {
              const message = `${data.displayTitle} ? Ouh...ça sent les dramas en préparations ça ! Merci ${data.surname}`;
              showToast(message, 5000); // 5 secondes pour les messages de succès
            })
            .catch(err => {
              console.error('Erreur copie :', err);
              showToast('Aucun dramas en vue par ici ❌', 2000); // 2 secondes pour les erreurs
            });
        } else {
          // ❌ SI PAS DE DONNÉES wheelData → message d'erreur
          showToast('Aucun dramas en vue par ici ❌', 2000); // 2 secondes pour les erreurs
        }
      });
    } else {
      // ✅ SI PAS DE DONNÉES → ornement désactivé
      ornement.style.opacity = "0.3";
      ornement.style.cursor = "default";
      ornement.style.pointerEvents = "none";
    }
  });
  
  await Promise.all(loadPromises);
  console.log('Ornements chargés:', Object.keys(ornementsData));
}

// Initialiser les ornements de la grille mobile
function initMobileOrnaments() {
  const mobileOrnaments = document.querySelectorAll('.mobile-ornament');
  
  mobileOrnaments.forEach(ornament => {
    const id = ornament.dataset.jsonId;
    
    ornament.addEventListener('click', async () => {
      // Charger les données si pas encore chargées
      if (!ornementsData[id]) {
        const data = await loadOrnementData(id);
        if (data) {
          ornementsData[id] = data;
        }
      }
      
      const data = ornementsData[id];
      
      if (data) {
        const hasWheelData = data.wheelData && data.wheelData.options && data.wheelData.options.length > 0;
        
        if (hasWheelData) {
          // Animation de clic
          ornament.style.transform = 'scale(0.95)';
          setTimeout(() => ornament.style.transform = '', 200);
          
          // Copier les données
          const jsonData = JSON.stringify(data.wheelData);
          
          navigator.clipboard.writeText(jsonData)
            .then(() => {
              const message = `${data.displayTitle} ? Ouh...ça sent les dramas en préparations ça ! Merci ${data.surname}`;
              showToast(message, 5000);
            })
            .catch(err => {
              console.error('Erreur copie :', err);
              showToast('Aucun dramas en vue par ici ❌', 2000);
            });
        } else {
          // Désactiver visuellement
          ornament.classList.add('disabled');
          showToast('Aucun dramas en vue par ici ❌', 2000);
        }
      }
    });
  });
}

// Lancer l'initialisation au chargement de la page
initOrnements();
initMobileOrnaments();

