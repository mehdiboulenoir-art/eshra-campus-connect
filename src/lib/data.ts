export const me = {
  name: "Yasmine Benali",
  initials: "YB",
  program: "Licence Hôtellerie & Restauration — 2e année",
  email: "y.benali@eshra.dz",
  city: "Alger",
  clubs: ["Club Gastronomie", "ESHRA Events Crew"],
  points: 340,
  badges: ["Bénévole de l'année", "Top contributeur", "Ambassadeur ESHRA"],
};

export const announcements = [
  { id: 1, title: "Inscriptions aux stages d'été ouvertes", body: "Les partenariats avec Sheraton Club des Pins, Hilton Alger et El Aurassi sont disponibles. Déposez votre CV au bureau des stages avant le 15 novembre.", date: "27 oct.", tag: "Carrière", pinned: true, author: "Bureau des stages" },
  { id: 2, title: "Nouvel horaire de la bibliothèque", body: "La bibliothèque sera ouverte de 8h à 20h du dimanche au jeudi pendant la période des examens.", date: "25 oct.", tag: "Campus", pinned: false, author: "Administration" },
  { id: 3, title: "Résultats des élections du BDE", body: "Félicitations au nouveau bureau 2026-2027 ! Merci aux 412 étudiants qui ont voté.", date: "22 oct.", tag: "BDE", pinned: false, author: "BDE ESHRA" },
  { id: 4, title: "Masterclass avec un chef étoilé", body: "Le chef invité animera une démonstration de pâtisserie française en cuisine pédagogique A.", date: "20 oct.", tag: "Académique", pinned: false, author: "Département Culinaire" },
];

export const events = [
  { id: 1, title: "Soirée d'intégration 2026", date: "06", month: "NOV", time: "19:00", place: "Grand Hall, Aïn Benian", category: "Soirée", going: 186, capacity: 250 },
  { id: 2, title: "Concours Jeunes Talents Culinaires", date: "13", month: "NOV", time: "10:00", place: "Cuisine pédagogique A", category: "Concours", going: 42, capacity: 60 },
  { id: 3, title: "Forum Emploi Hôtellerie", date: "20", month: "NOV", time: "09:30", place: "Amphi Ibn Khaldoun", category: "Carrière", going: 230, capacity: 400 },
  { id: 4, title: "Sortie Casbah d'Alger", date: "28", month: "NOV", time: "08:00", place: "Départ parking principal", category: "Culture", going: 38, capacity: 45 },
  { id: 5, title: "Tournoi de football inter-promos", date: "04", month: "DÉC", time: "15:00", place: "Terrain du campus", category: "Sport", going: 64, capacity: 80 },
];

export const clubs = [
  { id: 1, name: "Club Gastronomie", emoji: "🍽️", members: 84, desc: "Ateliers culinaires, dégustations et concours entre étudiants.", lead: "Karim Haddad" },
  { id: 2, name: "Club Sommellerie & Barista", emoji: "☕", members: 52, desc: "Art du café, mixologie sans alcool et accords mets-boissons.", lead: "Lina Meziane" },
  { id: 3, name: "ESHRA Events Crew", emoji: "🎉", members: 67, desc: "Organisation des grands événements de l'école.", lead: "Yasmine Benali" },
  { id: 4, name: "Club Sport", emoji: "⚽", members: 110, desc: "Football, basket, running et tournois inter-écoles.", lead: "Amine Touati" },
  { id: 5, name: "Club Voyage & Tourisme", emoji: "🧭", members: 58, desc: "Découverte du patrimoine algérien : Ghardaïa, Tlemcen, Djanet.", lead: "Sara Kaci" },
  { id: 6, name: "Club Langues", emoji: "🌍", members: 45, desc: "Cafés linguistiques en anglais, espagnol et italien.", lead: "Rayan Bouzid" },
];

export const polls = [
  { id: 1, question: "Quel thème pour la soirée de fin d'année ?", options: [{ label: "Nuit orientale", votes: 142 }, { label: "Gatsby années 20", votes: 98 }, { label: "Gala blanc", votes: 76 }], ends: "3 jours" },
  { id: 2, question: "Nouveau créneau pour la cafétéria le samedi ?", options: [{ label: "Oui, 9h–14h", votes: 201 }, { label: "Non, pas nécessaire", votes: 34 }], ends: "1 semaine" },
  { id: 3, question: "Quelle destination pour la sortie de printemps ?", options: [{ label: "Béjaïa", votes: 88 }, { label: "Tipaza", votes: 120 }, { label: "Constantine", votes: 65 }, { label: "Oran", votes: 71 }], ends: "12 jours" },
];

export const suggestions = [
  { id: 1, title: "Micro-ondes supplémentaires à la cafétéria", author: "Anonyme", votes: 87, status: "En cours" },
  { id: 2, title: "Navette depuis la gare de Chéraga", author: "Mehdi R.", votes: 154, status: "À l'étude" },
  { id: 3, title: "Salle de révision ouverte le week-end", author: "Nour A.", votes: 63, status: "Nouveau" },
  { id: 4, title: "Atelier CV & entretien en anglais", author: "Anonyme", votes: 41, status: "Réalisé" },
];

export const conversations = [
  { id: 1, name: "Club Gastronomie", initials: "CG", last: "Karim : RDV jeudi 14h en cuisine B 👨‍🍳", time: "12:40", unread: 3 },
  { id: 2, name: "Lina Meziane", initials: "LM", last: "Tu as les slides du cours de marketing ?", time: "11:02", unread: 1 },
  { id: 3, name: "BDE ESHRA", initials: "BDE", last: "Merci pour ton aide à la soirée !", time: "Hier", unread: 0 },
  { id: 4, name: "Promo L2 Hôtellerie", initials: "L2", last: "Amine : le partiel est reporté à lundi", time: "Hier", unread: 0 },
  { id: 5, name: "Sara Kaci", initials: "SK", last: "Inscris-toi vite pour la Casbah 😄", time: "Lun.", unread: 0 },
];

export const thread = [
  { from: "them", text: "Salut tout le monde ! L'atelier pâtisserie est confirmé.", time: "12:31" },
  { from: "them", text: "RDV jeudi 14h en cuisine B 👨‍🍳", time: "12:40" },
  { from: "me", text: "Parfait, je ramène les tabliers du club.", time: "12:44" },
];

export const adminStats = [
  { label: "Étudiants inscrits", value: "1 248", delta: "+32 ce mois" },
  { label: "Événements actifs", value: "12", delta: "5 cette semaine" },
  { label: "Suggestions ouvertes", value: "37", delta: "8 nouvelles" },
  { label: "Taux de participation", value: "68%", delta: "+6 pts" },
];
