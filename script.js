const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const chatMessages = document.getElementById('chatMessages');
        const loadingIndicator = document.getElementById('loadingIndicator');

        let sessionId = null; // Variable pour stocker l'ID de session

        // Fonction pour générer un ID de session unique (UUID v4)
        function generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        // Fonction pour ajouter un message à l'interface
        function addMessage(message, sender, messageId = null) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message-bubble');
            messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
            messageDiv.innerHTML = message; // Utiliser innerHTML pour permettre le Markdown
            chatMessages.appendChild(messageDiv);

            // Ajouter les boutons de feedback pour les messages de l'IA
            if (sender === 'ai' && messageId !== null) { // Vérifier si messageId est fourni (l'ID de la DB)
                const feedbackContainer = document.createElement('div');
                feedbackContainer.classList.add('feedback-buttons');
                feedbackContainer.dataset.messageId = messageId; // Stocker l'ID du message (ID de la DB)

                const likeButton = document.createElement('button');
                likeButton.classList.add('feedback-button', 'like');
                // MODIFICATION ICI: Encapsuler l'emoji dans un span avec une classe
                likeButton.innerHTML = '<span class="emoji-icon">👍</span> Utile'; 
                likeButton.onclick = () => sendFeedback(messageId, 1, feedbackContainer);

                const dislikeButton = document.createElement('button');
                dislikeButton.classList.add('feedback-button', 'dislike');
                // MODIFICATION ICI: Encapsuler l'emoji dans un span avec une classe
                dislikeButton.innerHTML = '<span class="emoji-icon">👎</span> Pas utile';
                dislikeButton.onclick = () => sendFeedback(messageId, 0, feedbackContainer);

                feedbackContainer.appendChild(likeButton);
                feedbackContainer.appendChild(dislikeButton);
                messageDiv.appendChild(feedbackContainer);
            }

            // Faire défiler vers le bas pour voir le dernier message
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Fonction pour envoyer le feedback au backend
        async function sendFeedback(messageId, feedbackValue, feedbackContainer) {
            // Désactiver les boutons après la sélection
            Array.from(feedbackContainer.children).forEach(button => {
                button.disabled = true;
                button.classList.remove('selected');
            });

            // Mettre en surbrillance le bouton sélectionné
            const selectedButton = feedbackValue === 1 ? feedbackContainer.querySelector('.like') : feedbackContainer.querySelector('.dislike');
            selectedButton.classList.add('selected');

            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/feedback/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message_id: messageId, // C'est maintenant l'ID de la DB
                        feedback_value: feedbackValue,
                        id_session: sessionId 
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Erreur lors de l\'envoi du feedback:', errorData.detail);
                    // Réactiver les boutons en cas d'erreur si l'on veut permettre de réessayer
                    Array.from(feedbackContainer.children).forEach(button => button.disabled = false);
                    selectedButton.classList.remove('selected');
                } else {
                    console.log('Feedback envoyé avec succès pour le message ID DB:', messageId, 'Valeur:', feedbackValue);
                    // Optionnel: Afficher un message de confirmation temporaire
                    const confirmation = document.createElement('span');
                    confirmation.textContent = ' Merci pour votre feedback !';
                    confirmation.style.marginLeft = '10px';
                    confirmation.style.color = '#4a90e2';
                    feedbackContainer.appendChild(confirmation);
                }
            } catch (error) {
                console.error('Erreur réseau lors de l\'envoi du feedback:', error);
                // Réactiver les boutons en cas d'erreur réseau
                Array.from(feedbackContainer.children).forEach(button => button.disabled = false);
                selectedButton.classList.remove('selected');
            }
        }


        // Fonction pour envoyer le message au backend
        async function sendMessage() {
            const message = chatInput.value.trim();
            if (message === '') return;

            // Si c'est le premier message, générer un ID de session
            if (!sessionId) {
                sessionId = generateUUID();
                console.log('Nouvelle session démarrée avec ID:', sessionId);
            }

            addMessage(message, 'user');
            chatInput.value = '';
            loadingIndicator.style.display = 'block'; // Afficher l'indicateur de chargement

            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/conversation/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        id_session: sessionId
                    }),
                });

                loadingIndicator.style.display = 'none'; // Cacher l'indicateur de chargement

                if (!response.ok) {
                    const errorData = await response.json();
                    const errorMessage = errorData.detail || 'Une erreur inconnue est survenue.';
                    addMessage(`Erreur: ${errorMessage}`, 'ai');
                    console.error('Erreur de l\'API:', errorData);
                    return;
                }

                const data = await response.json();
                
                // Utiliser data.ai_message_db_id pour le feedback
                // C'est l'ID numérique du log de la DB, pas un UUID client
                addMessage(data.reponse_ia, 'ai', data.ai_message_db_id); 

            } catch (error) {
                loadingIndicator.style.display = 'none'; // Cacher l'indicateur de chargement
                addMessage('Erreur réseau: Impossible de se connecter au serveur.', 'ai');
                console.error('Erreur réseau:', error);
            }
        }

        // Écouteurs d'événements
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });

        // Initialisation: Récupérer l'ID de session si stocké localement (pour reprendre une session)
        // Pour l'instant, nous générons un nouvel ID à chaque chargement de page.
        // Si vous voulez persister les sessions, vous utiliseriez localStorage ici.
        // Exemple: sessionId = localStorage.getItem('chatSessionId') || generateUUID();
        //          localStorage.setItem('chatSessionId', sessionId);
