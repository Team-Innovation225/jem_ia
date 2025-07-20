import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Stethoscope, 
  Pill, 
  BarChart3, 
  Bell, 
  Calendar, 
  Settings, 
  FileText, 
  Activity,
  MapPin,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  User,
  Home,
  Package,
  Heart,
  Siren,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  Bed,
  TestTube,
  UserPlus,
  UserCheck,
  DollarSign,
  Zap,
  X
} from 'lucide-react';

const SanteAIAdmin = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [statistics, setStatistics] = useState({
    totalPatients: 1247,
    totalConsultations: 856,
    equipment: 45,
    staff: 23,
    revenue: 125000,
    medicines: 850,
    prescriptions: 324
  });

  // Données du personnel
  const [staffList, setStaffList] = useState([
    {
      id: 1,
      name: "Dr. Sarah Martin",
      role: "Médecin Chef",
      department: "Cardiologie",
      status: "En service",
      phone: "+225 07 123 456",
      email: "s.martin@hopital.ci",
      shift: "Jour",
      experience: "15 ans"
    },
    {
      id: 2,
      name: "Marie Kouadio",
      role: "Infirmière",
      department: "Urgences", 
      status: "En congé",
      phone: "+225 05 987 654",
      email: "m.kouadio@hopital.ci",
      shift: "Nuit",
      experience: "8 ans"
    }
  ]);

  // Simulation de données en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setStatistics(prev => ({
        ...prev,
        totalPatients: prev.totalPatients + Math.floor(Math.random() * 3),
        totalConsultations: prev.totalConsultations + Math.floor(Math.random() * 2),
        prescriptions: prev.prescriptions + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const structureTypes = [
    {
      id: 'hopital',
      name: 'Hôpital',
      icon: Building2,
      description: 'Gestion complète des services hospitaliers',
      features: ['Gestion des lits', 'Blocs opératoires', 'Urgences', 'Laboratoires'],
      color: '#2563eb'
    },
    {
      id: 'pharmacie',
      name: 'Pharmacie',
      icon: Pill,
      description: 'Gestion des stocks et dispensation',
      features: ['Inventaire médicaments', 'Ordonnances', 'Conseil patients', 'Pharmacovigilance'],
      color: '#10b981'
    }
  ];

  // Menu items basés sur le type de structure
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
      { id: 'staff', label: 'Personnel', icon: Users }
    ];

    if (selectedStructure?.id === 'hopital') {
      return [
        ...baseItems,
        { id: 'resources', label: 'Ressources', icon: Building2 },
        { id: 'consultations', label: 'Consultations', icon: Stethoscope },
        { id: 'emergency', label: 'Urgences', icon: Siren },
        { id: 'laboratory', label: 'Laboratoire', icon: TestTube },
        { id: 'reports', label: 'Rapports', icon: FileText },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Paramètres', icon: Settings }
      ];
    } else if (selectedStructure?.id === 'pharmacie') {
      return [
        ...baseItems,
        { id: 'inventory', label: 'Inventaire', icon: Package },
        { id: 'prescriptions', label: 'Ordonnances', icon: FileText },
        { id: 'sales', label: 'Ventes', icon: ShoppingCart },
        { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
        { id: 'pharmacovigilance', label: 'Pharmacovigilance', icon: Shield },
        { id: 'reports', label: 'Rapports', icon: BarChart3 },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Paramètres', icon: Settings }
      ];
    }

    return baseItems;
  };

  const mockNotifications = [
    {
      id: 1,
      type: 'alert',
      title: selectedStructure?.id === 'pharmacie' ? 'Stock faible détecté' : 'Urgence médicale',
      message: selectedStructure?.id === 'pharmacie' ? 'Le stock de paracétamol est en dessous du seuil critique' : 'Patient en état critique en salle 204',
      time: '2 min',
      priority: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: selectedStructure?.id === 'pharmacie' ? 'Nouvelle commande reçue' : 'Nouveau patient enregistré',
      message: selectedStructure?.id === 'pharmacie' ? 'Commande de 500 boîtes d\'amoxicilline livrée' : 'Un nouveau patient a été ajouté au système',
      time: '5 min',
      priority: 'normal'
    }
  ];

  const HomePage = () => (
    <div style={styles.homePage}>
      <div style={styles.homeHeader}>
        <div style={styles.logo}>
          <Activity size={40} style={{ color: '#2563eb' }} />
          <h1 style={styles.appTitle}>SantéAI</h1>
        </div>
        <p style={styles.subtitle}>Plateforme intelligente de gestion des structures médicales</p>
      </div>

      <div style={styles.structureGrid}>
        {structureTypes.map((structure) => {
          const IconComponent = structure.icon;
          return (
            <div
              key={structure.id}
              style={{...styles.structureCard, borderLeft: `4px solid ${structure.color}`}}
              onClick={() => {
                setSelectedStructure(structure);
                setCurrentView('dashboard');
              }}
            >
              <div style={{...styles.structureIcon, color: structure.color}}>
                <IconComponent size={48} />
              </div>
              <h3 style={styles.structureName}>{structure.name}</h3>
              <p style={styles.structureDescription}>{structure.description}</p>
              <div style={styles.featuresList}>
                {structure.features.map((feature, index) => (
                  <span key={index} style={{...styles.featureTag, backgroundColor: `${structure.color}20`, color: structure.color}}>{feature}</span>
                ))}
              </div>
              <button style={{...styles.selectButton, background: `linear-gradient(135deg, ${structure.color}, ${structure.color}dd)`}}>
                Sélectionner cette structure
              </button>
            </div>
          );
        })}
      </div>

      <div style={styles.homeFooter}>
        <div style={styles.aiFeatures}>
          <h3>Fonctionnalités IA Avancées</h3>
          <div style={styles.aiGrid}>
            <div style={styles.aiCard}>
              <TrendingUp size={24} />
              <span>Analyse prédictive</span>
            </div>
            <div style={styles.aiCard}>
              <AlertTriangle size={24} />
              <span>Alertes intelligentes</span>
            </div>
            <div style={styles.aiCard}>
              <BarChart3 size={24} />
              <span>Rapports automatisés</span>
            </div>
            <div style={styles.aiCard}>
              <Zap size={24} />
              <span>Optimisation temps réel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => {
    const getStatsForStructure = () => {
      if (selectedStructure?.id === 'pharmacie') {
        return [
          {
            icon: Package,
            value: statistics.medicines.toLocaleString(),
            label: 'Médicaments en stock',
            trend: '+5% ce mois',
            color: '#10b981'
          },
          {
            icon: FileText,
            value: statistics.prescriptions.toLocaleString(),
            label: 'Ordonnances traitées',
            trend: '+12% ce mois',
            color: '#3b82f6'
          },
          {
            icon: DollarSign,
            value: `${Math.round(statistics.revenue / 1000)}K FCFA`,
            label: 'Chiffre d\'affaires',
            trend: '+8% ce mois',
            color: '#f59e0b'
          },
          {
            icon: Users,
            value: statistics.staff.toString(),
            label: 'Personnel actif',
            trend: 'Optimal',
            color: '#8b5cf6'
          }
        ];
      } else {
        return [
          {
            icon: Users,
            value: statistics.totalPatients.toLocaleString(),
            label: 'Patients totaux',
            trend: '+12% ce mois',
            color: '#3b82f6'
          },
          {
            icon: Stethoscope,
            value: statistics.totalConsultations.toLocaleString(),
            label: 'Consultations',
            trend: '+8% ce mois',
            color: '#10b981'
          },
          {
            icon: Bed,
            value: '95%',
            label: 'Taux d\'occupation',
            trend: 'Optimal',
            color: '#f59e0b'
          },
          {
            icon: Activity,
            value: '4.8/5',
            label: 'Satisfaction patients',
            trend: 'Excellent',
            color: '#ef4444'
          }
        ];
      }
    };

    return (
      <div style={styles.dashboard}>
        <div style={styles.statsGrid}>
          {getStatsForStructure().map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} style={styles.statCard}>
                <div style={{...styles.statIcon, backgroundColor: `${stat.color}20`, color: stat.color}}>
                  <IconComponent size={24} />
                </div>
                <div style={styles.statContent}>
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                  <span style={{...styles.statTrend, color: stat.color}}>{stat.trend}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.dashboardGrid}>
          <div style={styles.chartCard}>
            <h3>{selectedStructure?.id === 'pharmacie' ? 'Ventes journalières' : 'Activité en temps réel'}</h3>
            <div style={styles.chartPlaceholder}>
              <BarChart3 size={48} />
              <p>{selectedStructure?.id === 'pharmacie' ? 'Graphique des ventes par médicament' : 'Graphique des consultations par heure'}</p>
            </div>
          </div>

          <div style={styles.alertsCard}>
            <h3>Alertes IA récentes</h3>
            <div style={styles.alertsList}>
              {mockNotifications.map(notification => (
                <div key={notification.id} style={styles.alertItem}>
                  <div style={{
                    ...styles.alertIndicator,
                    backgroundColor: notification.priority === 'high' ? '#ef4444' : 
                                   notification.priority === 'normal' ? '#f59e0b' : '#10b981'
                  }} />
                  <div style={styles.alertContent}>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span>{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StaffManagement = () => {
    const addStaff = (newStaff) => {
      setStaffList([...staffList, { ...newStaff, id: Date.now() }]);
      setShowAddStaffModal(false);
    };

    return (
      <div style={styles.staffView}>
        <div style={styles.sectionHeader}>
          <h2>Gestion du Personnel</h2>
          <button 
            style={styles.primaryButton}
            onClick={() => setShowAddStaffModal(true)}
          >
            <UserPlus size={20} />
            Ajouter un employé
          </button>
        </div>

        <div style={styles.staffStats}>
          <div style={styles.staffStatCard}>
            <Users size={24} />
            <div>
              <h3>{staffList.length}</h3>
              <p>Total employés</p>
            </div>
          </div>
          <div style={styles.staffStatCard}>
            <UserCheck size={24} />
            <div>
              <h3>{staffList.filter(s => s.status === 'En service').length}</h3>
              <p>En service</p>
            </div>
          </div>
          <div style={styles.staffStatCard}>
            <Clock size={24} />
            <div>
              <h3>{staffList.filter(s => s.shift === 'Nuit').length}</h3>
              <p>Équipe de nuit</p>
            </div>
          </div>
        </div>

        <div style={styles.staffGrid}>
          {staffList.map(staff => (
            <div key={staff.id} style={styles.staffCard}>
              <div style={styles.staffHeader}>
                <div style={styles.staffAvatar}>
                  <User size={24} />
                </div>
                <div style={styles.staffInfo}>
                  <h3>{staff.name}</h3>
                  <p>{staff.role}</p>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: staff.status === 'En service' ? '#d1fae5' : '#fee2e2',
                    color: staff.status === 'En service' ? '#065f46' : '#991b1b'
                  }}>
                    {staff.status}
                  </span>
                </div>
              </div>
              <div style={styles.staffDetails}>
                <div style={styles.staffDetailItem}>
                  <Building2 size={16} />
                  <span>{staff.department}</span>
                </div>
                <div style={styles.staffDetailItem}>
                  <Phone size={16} />
                  <span>{staff.phone}</span>
                </div>
                <div style={styles.staffDetailItem}>
                  <Mail size={16} />
                  <span>{staff.email}</span>
                </div>
                <div style={styles.staffDetailItem}>
                  <Clock size={16} />
                  <span>Équipe {staff.shift} • {staff.experience}</span>
                </div>
              </div>
              <div style={styles.staffActions}>
                <button style={styles.actionButton}>
                  <Edit size={16} />
                  Modifier
                </button>
                <button style={styles.actionButton}>
                  <Eye size={16} />
                  Voir profil
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAddStaffModal && (
          <AddStaffModal 
            onClose={() => setShowAddStaffModal(false)}
            onAdd={addStaff}
            structureType={selectedStructure?.id}
          />
        )}
      </div>
    );
  };

  const AddStaffModal = ({ onClose, onAdd, structureType }) => {
    const [formData, setFormData] = useState({
      name: '',
      role: '',
      department: '',
      phone: '',
      email: '',
      shift: 'Jour',
      experience: ''
    });

    const departmentOptions = structureType === 'pharmacie' 
      ? ['Officine', 'Stockage', 'Conseil', 'Administration']
      : ['Cardiologie', 'Urgences', 'Chirurgie', 'Pédiatrie', 'Laboratoire', 'Administration'];

    const roleOptions = structureType === 'pharmacie'
      ? ['Pharmacien', 'Préparateur', 'Technicien', 'Assistant', 'Gestionnaire']
      : ['Médecin', 'Infirmier(e)', 'Aide-soignant(e)', 'Technicien', 'Administrateur'];

    const handleSubmit = (e) => {
      e.preventDefault();
      onAdd({ ...formData, status: 'En service' });
    };

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h3>Ajouter un nouvel employé</h3>
            <button style={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} style={styles.modalForm}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Nom complet</label>
                <input
                  type="text"
                  style={styles.formInput}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label>Poste</label>
                <select
                  style={styles.formInput}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un poste</option>
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Département</label>
                <select
                  style={styles.formInput}
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un département</option>
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label>Équipe</label>
                <select
                  style={styles.formInput}
                  value={formData.shift}
                  onChange={(e) => setFormData({...formData, shift: e.target.value})}
                >
                  <option value="Jour">Jour</option>
                  <option value="Nuit">Nuit</option>
                  <option value="Mixte">Mixte</option>
                </select>
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label>Téléphone</label>
                <input
                  type="tel"
                  style={styles.formInput}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+225 XX XXX XXX"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  style={styles.formInput}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label>Expérience</label>
              <input
                type="text"
                style={styles.formInput}
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Ex: 5 ans"
                required
              />
            </div>
            <div style={styles.modalActions}>
              <button type="button" style={styles.cancelButton} onClick={onClose}>
                Annuler
              </button>
              <button type="submit" style={styles.submitButton}>
                Ajouter l'employé
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const PharmacyInventory = () => (
    <div style={styles.inventoryView}>
      <div style={styles.sectionHeader}>
        <h2>Gestion de l'Inventaire</h2>
        <div style={styles.headerActions}>
          <button style={styles.secondaryButton}>
            <Download size={20} />
            Exporter
          </button>
          <button style={styles.primaryButton}>
            <Plus size={20} />
            Nouveau médicament
          </button>
        </div>
      </div>

      <div style={styles.inventoryStats}>
        <div style={styles.inventoryStatCard}>
          <Package size={24} style={{ color: '#10b981' }} />
          <div>
            <h3>850</h3>
            <p>Médicaments en stock</p>
          </div>
        </div>
        <div style={styles.inventoryStatCard}>
          <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
          <div>
            <h3>23</h3>
            <p>Stocks faibles</p>
          </div>
        </div>
        <div style={styles.inventoryStatCard}>
          <Clock size={24} style={{ color: '#ef4444' }} />
          <div>
            <h3>5</h3>
            <p>Bientôt expirés</p>
          </div>
        </div>
      </div>

      <div style={styles.inventoryFilters}>
        <div style={styles.searchBox}>
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un médicament..."
            style={styles.searchInput}
          />
        </div>
        <button style={styles.filterButton}>
          <Filter size={20} />
          Filtres
        </button>
      </div>

      <div style={styles.inventoryTable}>
        <div style={styles.tableHeader}>
          <span>Médicament</span>
          <span>Code</span>
          <span>Stock</span>
          <span>Prix</span>
          <span>Expiration</span>
          <span>Statut</span>
          <span>Actions</span>
        </div>
        {[
          { name: 'Paracétamol 500mg', code: 'PAR500', stock: 150, price: '500 FCFA', expiry: '12/2025', status: 'Normal' },
          { name: 'Amoxicilline 250mg', code: 'AMX250', stock: 45, price: '2500 FCFA', expiry: '08/2024', status: 'Faible' },
          { name: 'Ibuprofène 400mg', code: 'IBU400', stock: 8, price: '750 FCFA', expiry: '09/2024', status: 'Critique' }
        ].map((item, index) => (
          <div key={index} style={styles.tableRow}>
            <span style={styles.medicamentName}>{item.name}</span>
            <span>{item.code}</span>
            <span>{item.stock}</span>
            <span>{item.price}</span>
            <span>{item.expiry}</span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: item.status === 'Normal' ? '#d1fae5' : 
                             item.status === 'Faible' ? '#fef3c7' : '#fee2e2',
              color: item.status === 'Normal' ? '#065f46' : 
                    item.status === 'Faible' ? '#d97706' : '#991b1b'
            }}>
              {item.status}
            </span>
            <div style={styles.tableActions}>
              <button style={styles.actionButton}>
                <Edit size={16} />
              </button>
              <button style={styles.actionButton}>
                <Eye size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PharmacySales = () => (
    <div style={styles.salesView}>
      <div style={styles.sectionHeader}>
        <h2>Gestion des Ventes</h2>
        <button style={styles.primaryButton}>
          <Plus size={20} />
          Nouvelle vente
        </button>
      </div>

      <div style={styles.salesStats}>
        <div style={styles.salesStatCard}>
          <ShoppingCart size={24} style={{ color: '#3b82f6' }} />
          <div>
            <h3>324</h3>
            <p>Ventes aujourd'hui</p>
            <span style={styles.salesTrend}>+15% vs hier</span>
          </div>
        </div>
        <div style={styles.salesStatCard}>
          <DollarSign size={24} style={{ color: '#10b981' }} />
          <div>
            <h3>850K FCFA</h3>
            <p>CA du jour</p>
            <span style={styles.salesTrend}>+8% vs hier</span>
          </div>
        </div>
        <div style={styles.salesStatCard}>
          <CreditCard size={24} style={{ color: '#f59e0b' }} />
          <div>
            <h3>280</h3>
            <p>Ordonnances</p>
            <span style={styles.salesTrend}>Normal</span>
          </div>
        </div>
      </div>

      <div style={styles.recentSales}>
        <h3>Ventes récentes</h3>
        <div style={styles.salesList}>
          {[
            { id: 'V001', time: '14:30', customer: 'Mme Diabaté', amount: '12,500 FCFA', items: 3 },
            { id: 'V002', time: '14:25', customer: 'M. Kouassi', amount: '8,750 FCFA', items: 2 },
            { id: 'V003', time: '14:20', customer: 'Mlle Traoré', amount: '15,200 FCFA', items: 5 }
          ].map(sale => (
            <div key={sale.id} style={styles.saleItem}>
              <div style={styles.saleInfo}>
                <span style={styles.saleId}>{sale.id}</span>
                <span style={styles.saleTime}>{sale.time}</span>
              </div>
              <div style={styles.saleCustomer}>{sale.customer}</div>
              <div style={styles.saleDetails}>
                <span>{sale.items} articles</span>
                <span style={styles.saleAmount}>{sale.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (currentView === 'home') {
    return <HomePage />;
  }

  const menuItems = getMenuItems();

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <button 
            style={styles.backButton}
            onClick={() => {
              setCurrentView('home');
              setSelectedStructure(null);
            }}
          >
            <Home size={20} />
            Accueil
          </button>
          <div style={styles.structureInfo}>
            {selectedStructure && (
              <>
                {React.createElement(selectedStructure.icon, { size: 24, color: selectedStructure.color })}
                <span>{selectedStructure.name}</span>
              </>
            )}
          </div>
        </div>

        <ul style={styles.menu}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  style={{
                    ...styles.menuItem,
                    ...(currentView === item.id ? {...styles.activeMenuItem, backgroundColor: selectedStructure?.color} : {})
                  }}
                  onClick={() => setCurrentView(item.id)}
                >
                  <IconComponent size={20} />
                  {item.label}
                  {item.id === 'notifications' && mockNotifications.length > 0 && (
                    <span style={styles.notificationBadge}>{mockNotifications.length}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.pageTitle}>
              {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h1>
          </div>
          <div style={styles.headerRight}>
            <button style={styles.notificationButton}>
              <Bell size={20} />
              {mockNotifications.length > 0 && (
                <span style={styles.notificationDot}></span>
              )}
            </button>
            <div style={styles.userProfile}>
              <div style={styles.avatar}>
                <User size={20} />
              </div>
              <span>Administrateur</span>
            </div>
          </div>
        </header>

        <div style={styles.content}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'staff' && <StaffManagement />}
          {currentView === 'resources' && (
            <div style={styles.resourcesView}>
              <div style={styles.sectionHeader}>
                <h2>Gestion des Ressources</h2>
                <button style={styles.primaryButton}>
                  <Plus size={20} />
                  Ajouter une ressource
                </button>
              </div>

              <div style={styles.resourceTabs}>
                <button style={styles.activeTab}>Salles</button>
                <button style={styles.tab}>Équipements</button>
                <button style={styles.tab}>Matériel médical</button>
              </div>

              <div style={styles.resourceGrid}>
                <div style={styles.resourceCard}>
                  <div style={styles.resourceHeader}>
                    <h3>Salle d'opération 1</h3>
                    <span style={styles.statusBadge}>Occupée</span>
                  </div>
                  <div style={styles.resourceDetails}>
                    <p><MapPin size={16} /> Bloc chirurgical - Niveau 2</p>
                    <p><Clock size={16} /> Disponible à 14h30</p>
                    <p><User size={16} /> Dr. Martin (Chirurgie cardiaque)</p>
                  </div>
                </div>

                <div style={styles.resourceCard}>
                  <div style={styles.resourceHeader}>
                    <h3>Scanner IRM</h3>
                    <span style={styles.statusBadgeAvailable}>Disponible</span>
                  </div>
                  <div style={styles.resourceDetails}>
                    <p><MapPin size={16} /> Service imagerie - RDC</p>
                    <p><Clock size={16} /> Prochaine maintenance: 25/07</p>
                    <p><Activity size={16} /> Fonctionnel</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {currentView === 'inventory' && <PharmacyInventory />}
          {currentView === 'sales' && <PharmacySales />}
          {currentView === 'prescriptions' && (
            <div style={styles.prescriptionsView}>
              <div style={styles.sectionHeader}>
                <h2>Gestion des Ordonnances</h2>
                <button style={styles.primaryButton}>
                  <Plus size={20} />
                  Nouvelle ordonnance
                </button>
              </div>
              
              <div style={styles.prescriptionStats}>
                <div style={styles.prescriptionStatCard}>
                  <FileText size={24} style={{ color: '#3b82f6' }} />
                  <div>
                    <h3>45</h3>
                    <p>En attente</p>
                  </div>
                </div>
                <div style={styles.prescriptionStatCard}>
                  <CheckCircle size={24} style={{ color: '#10b981' }} />
                  <div>
                    <h3>280</h3>
                    <p>Traitées aujourd'hui</p>
                  </div>
                </div>
                <div style={styles.prescriptionStatCard}>
                  <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
                  <div>
                    <h3>3</h3>
                    <p>Problèmes détectés</p>
                  </div>
                </div>
              </div>

              <div style={styles.prescriptionsList}>
                <h3>Ordonnances récentes</h3>
                {[
                  { id: 'ORD001', patient: 'Mme Diabaté', doctor: 'Dr. Kouassi', status: 'En cours', time: '14:30' },
                  { id: 'ORD002', patient: 'M. Traoré', doctor: 'Dr. Bamba', status: 'Terminée', time: '14:25' },
                  { id: 'ORD003', patient: 'Mlle Ouattara', doctor: 'Dr. Silué', status: 'Vérification', time: '14:20' }
                ].map(prescription => (
                  <div key={prescription.id} style={styles.prescriptionItem}>
                    <div style={styles.prescriptionHeader}>
                      <span style={styles.prescriptionId}>{prescription.id}</span>
                      <span style={styles.prescriptionTime}>{prescription.time}</span>
                    </div>
                    <div style={styles.prescriptionDetails}>
                      <p><strong>Patient:</strong> {prescription.patient}</p>
                      <p><strong>Médecin:</strong> {prescription.doctor}</p>
                    </div>
                    <div style={styles.prescriptionFooter}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: prescription.status === 'Terminée' ? '#d1fae5' : 
                                       prescription.status === 'En cours' ? '#fef3c7' : '#fee2e2',
                        color: prescription.status === 'Terminée' ? '#065f46' : 
                              prescription.status === 'En cours' ? '#d97706' : '#991b1b'
                      }}>
                        {prescription.status}
                      </span>
                      <button style={styles.actionButton}>Voir détails</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentView === 'consultations' && (
            <div style={styles.consultationsView}>
              <div style={styles.sectionHeader}>
                <h2>Historique des Consultations</h2>
                <button style={styles.primaryButton}>
                  <Plus size={20} />
                  Nouvelle consultation
                </button>
              </div>

              <div style={styles.consultationFilters}>
                <div style={styles.searchBox}>
                  <Search size={20} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un patient..."
                    style={styles.searchInput}
                  />
                </div>
                <select style={styles.filterSelect}>
                  <option>Tous les médecins</option>
                  <option>Dr. Martin</option>
                  <option>Dr. Kouassi</option>
                </select>
                <input type="date" style={styles.dateInput} />
              </div>

              <div style={styles.consultationsList}>
                {[
                  { id: 'C001', patient: 'Jean Kouadio', doctor: 'Dr. Martin', time: '14:30', date: '19/07/2025', type: 'Cardiologie' },
                  { id: 'C002', patient: 'Marie Diabaté', doctor: 'Dr. Bamba', time: '14:00', date: '19/07/2025', type: 'Généraliste' },
                  { id: 'C003', patient: 'Pierre Traoré', doctor: 'Dr. Silué', time: '13:30', date: '19/07/2025', type: 'Pédiatrie' }
                ].map(consultation => (
                  <div key={consultation.id} style={styles.consultationCard}>
                    <div style={styles.consultationHeader}>
                      <div>
                        <h3>{consultation.patient}</h3>
                        <p>{consultation.type}</p>
                      </div>
                      <span style={styles.consultationId}>{consultation.id}</span>
                    </div>
                    <div style={styles.consultationDetails}>
                      <div style={styles.consultationDetailItem}>
                        <Stethoscope size={16} />
                        <span>{consultation.doctor}</span>
                      </div>
                      <div style={styles.consultationDetailItem}>
                        <Calendar size={16} />
                        <span>{consultation.date}</span>
                      </div>
                      <div style={styles.consultationDetailItem}>
                        <Clock size={16} />
                        <span>{consultation.time}</span>
                      </div>
                    </div>
                    <div style={styles.consultationActions}>
                      <button style={styles.actionButton}>
                        <Eye size={16} />
                        Voir dossier
                      </button>
                      <button style={styles.actionButton}>
                        <FileText size={16} />
                        Rapport
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentView === 'emergency' && (
            <div style={styles.emergencyView}>
              <div style={styles.sectionHeader}>
                <h2>Service des Urgences</h2>
                <button style={styles.emergencyButton}>
                  <Siren size={20} />
                  Nouvelle urgence
                </button>
              </div>

              <div style={styles.emergencyStats}>
                <div style={styles.emergencyStatCard}>
                  <Siren size={24} style={{ color: '#ef4444' }} />
                  <div>
                    <h3>12</h3>
                    <p>Patients en attente</p>
                  </div>
                </div>
                <div style={styles.emergencyStatCard}>
                  <Heart size={24} style={{ color: '#f59e0b' }} />
                  <div>
                    <h3>3</h3>
                    <p>Cas critiques</p>
                  </div>
                </div>
                <div style={styles.emergencyStatCard}>
                  <Clock size={24} style={{ color: '#10b981' }} />
                  <div>
                    <h3>15 min</h3>
                    <p>Temps d'attente moyen</p>
                  </div>
                </div>
              </div>

              <div style={styles.emergencyQueue}>
                <h3>File d'attente des urgences</h3>
                {[
                  { id: 'URG001', patient: 'Urgence Anonyme', priority: 'Critique', time: '5 min', reason: 'Arrêt cardiaque' },
                  { id: 'URG002', patient: 'Mme Koffi', priority: 'Élevée', time: '12 min', reason: 'Fracture ouverte' },
                  { id: 'URG003', patient: 'M. Yao', priority: 'Normale', time: '25 min', reason: 'Douleurs abdominales' }
                ].map(emergency => (
                  <div key={emergency.id} style={styles.emergencyItem}>
                    <div style={styles.emergencyPriority}>
                      <div style={{
                        ...styles.priorityIndicator,
                        backgroundColor: emergency.priority === 'Critique' ? '#ef4444' : 
                                       emergency.priority === 'Élevée' ? '#f59e0b' : '#10b981'
                      }} />
                      <span>{emergency.priority}</span>
                    </div>
                    <div style={styles.emergencyInfo}>
                      <h4>{emergency.patient}</h4>
                      <p>{emergency.reason}</p>
                    </div>
                    <div style={styles.emergencyTime}>
                      <span>Attente: {emergency.time}</span>
                    </div>
                    <button style={styles.takeChargeButton}>
                      Prendre en charge
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentView === 'suppliers' && (
            <div style={styles.suppliersView}>
              <div style={styles.sectionHeader}>
                <h2>Gestion des Fournisseurs</h2>
                <button style={styles.primaryButton}>
                  <Plus size={20} />
                  Nouveau fournisseur
                </button>
              </div>

              <div style={styles.suppliersList}>
                {[
                  { name: 'PharmaCorp CI', contact: 'M. Adjoumani', phone: '+225 27 XX XX XX', status: 'Actif', lastOrder: '15/07/2025' },
                  { name: 'MediSupply Abidjan', contact: 'Mme Brou', phone: '+225 05 XX XX XX', status: 'Actif', lastOrder: '12/07/2025' },
                  { name: 'Global Pharma', contact: 'M. Sangaré', phone: '+225 07 XX XX XX', status: 'Suspendu', lastOrder: '28/06/2025' }
                ].map((supplier, index) => (
                  <div key={index} style={styles.supplierCard}>
                    <div style={styles.supplierHeader}>
                      <h3>{supplier.name}</h3>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: supplier.status === 'Actif' ? '#d1fae5' : '#fee2e2',
                        color: supplier.status === 'Actif' ? '#065f46' : '#991b1b'
                      }}>
                        {supplier.status}
                      </span>
                    </div>
                    <div style={styles.supplierDetails}>
                      <p><strong>Contact:</strong> {supplier.contact}</p>
                      <p><strong>Téléphone:</strong> {supplier.phone}</p>
                      <p><strong>Dernière commande:</strong> {supplier.lastOrder}</p>
                    </div>
                    <div style={styles.supplierActions}>
                      <button style={styles.actionButton}>
                        <Truck size={16} />
                        Nouvelle commande
                      </button>
                      <button style={styles.actionButton}>
                        <Eye size={16} />
                        Voir historique
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentView === 'notifications' && (
            <div style={styles.notificationsView}>
              <h2>Centre de Notifications IA</h2>
              <div style={styles.notificationsList}>
                {mockNotifications.map(notification => (
                  <div key={notification.id} style={styles.notificationCard}>
                    <div style={styles.notificationHeader}>
                      <h3>{notification.title}</h3>
                      <span style={styles.notificationTime}>{notification.time}</span>
                    </div>
                    <p>{notification.message}</p>
                    <div style={styles.notificationActions}>
                      <button style={styles.actionButton}>Marquer comme lu</button>
                      <button style={styles.actionButton}>Voir détails</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(currentView === 'reports' || currentView === 'settings' || currentView === 'laboratory' || currentView === 'pharmacovigilance') && (
            <div style={styles.placeholder}>
              {currentView === 'reports' && <><FileText size={48} /><h3>Rapports et Statistiques</h3><p>Génération automatique de rapports détaillés</p></>}
              {currentView === 'settings' && <><Settings size={48} /><h3>Paramètres Système</h3><p>Configuration et préférences de l'établissement</p></>}
              {currentView === 'laboratory' && <><TestTube size={48} /><h3>Laboratoire</h3><p>Gestion des analyses et résultats de laboratoire</p></>}
              {currentView === 'pharmacovigilance' && <><Shield size={48} /><h3>Pharmacovigilance</h3><p>Surveillance et signalement des effets indésirables</p></>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  
  // Page d'accueil
  homePage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    color: 'white'
  },
  
  homeHeader: {
    textAlign: 'center',
    marginBottom: '4rem'
  },
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  },
  
  appTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: 0,
    background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  
  subtitle: {
    fontSize: '1.25rem',
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto'
  },
  
  structureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  
  structureCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    color: '#1f2937',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  },
  
  structureIcon: {
    marginBottom: '1rem'
  },
  
  structureName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem'
  },
  
  structureDescription: {
    color: '#6b7280',
    marginBottom: '1.5rem'
  },
  
  featuresList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
    marginBottom: '1.5rem'
  },
  
  featureTag: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  
  selectButton: {
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%'
  },
  
  homeFooter: {
    marginTop: '4rem',
    textAlign: 'center'
  },
  
  aiFeatures: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '2rem',
    backdropFilter: 'blur(10px)'
  },
  
  aiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  
  aiCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px'
  },

  // Sidebar
  sidebar: {
    width: '280px',
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '0',
    overflowY: 'auto'
  },
  
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #374151'
  },
  
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: '1px solid #4b5563',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    width: '100%',
    justifyContent: 'center'
  },
  
  structureInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#374151',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },

  menu: {
    listStyle: 'none',
    padding: '1rem 0',
    margin: 0
  },

  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#d1d5db',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  },

  activeMenuItem: {
    color: 'white'
  },

  notificationBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto'
  },

  // Main content
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },

  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },

  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },

  notificationButton: {
    position: 'relative',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#6b7280'
  },

  notificationDot: {
    position: 'absolute',
    top: '0.25rem',
    right: '0.25rem',
    width: '8px',
    height: '8px',
    backgroundColor: '#ef4444',
    borderRadius: '50%'
  },

  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  avatar: {
    width: '32px',
    height: '32px',
    backgroundColor: '#2563eb',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },

  content: {
    flex: 1,
    padding: '2rem',
    overflow: 'auto'
  },

  // Dashboard
  dashboard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },

  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statContent: {
    flex: 1
  },

  statTrend: {
    fontSize: '0.875rem',
    fontWeight: '500'
  },

  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem'
  },

  chartCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  chartPlaceholder: {
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginTop: '1rem'
  },

  alertsCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  alertsList: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },

  alertItem: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    backgroundColor: '#f9fafb'
  },

  alertIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '0.5rem',
    flexShrink: 0
  },

  alertContent: {
    flex: 1,
    fontSize: '0.875rem'
  },

  // Section headers et boutons communs
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem'
  },

  headerActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  primaryButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  secondaryButton: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  emergencyButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },

  statusBadgeAvailable: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },

  actionButton: {
    backgroundColor: '#f3f4f6',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  // Staff Management
  staffView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  staffStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },

  staffStatCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  staffGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },

  staffCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  staffHeader: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem'
  },

  staffAvatar: {
    width: '48px',
    height: '48px',
    backgroundColor: '#e0e7ff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3730a3'
  },

  staffInfo: {
    flex: 1
  },

  staffDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem'
  },

  staffDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },

  staffActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },

  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem'
  },

  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.5rem'
  },

  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  formInput: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem'
  },

  modalActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },

  cancelButton: {
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #d1d5db',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  submitButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer'
  },

  // Pharmacy specific styles
  inventoryView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  inventoryStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },

  inventoryStatCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  inventoryFilters: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    flex: 1,
    maxWidth: '400px'
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    flex: 1,
    fontSize: '0.875rem'
  },

  filterButton: {
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  filterSelect: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem'
  },

  dateInput: {
    padding: '0.5rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.875rem'
  },

  inventoryTable: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#374151'
  },

  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    borderTop: '1px solid #e5e7eb',
    alignItems: 'center'
  },

  medicamentName: {
    fontWeight: '500'
  },

  tableActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  // Sales view
  salesView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  salesStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },

  salesStatCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  salesTrend: {
    fontSize: '0.75rem',
    color: '#10b981',
    fontWeight: '500'
  },

  recentSales: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  salesList: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  saleItem: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    alignItems: 'center'
  },

  saleInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },

  saleId: {
    fontWeight: '500',
    fontSize: '0.875rem'
  },

  saleTime: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },

  saleCustomer: {
    fontSize: '0.875rem'
  },

  saleDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem'
  },

  saleAmount: {
    fontWeight: '600',
    color: '#10b981'
  },

  // Prescriptions
  prescriptionsView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  prescriptionStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },

  prescriptionStatCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  prescriptionsList: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  prescriptionItem: {
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '1rem'
  },

  prescriptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },

  prescriptionId: {
    fontWeight: '600',
    color: '#2563eb'
  },

  prescriptionTime: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },

  prescriptionDetails: {
    fontSize: '0.875rem',
    marginBottom: '1rem'
  },

  prescriptionFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  // Consultations
  consultationsView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  consultationFilters: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },

  consultationsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },

  consultationCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  consultationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },

  consultationId: {
    fontSize: '0.75rem',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px'
  },

  consultationDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem'
  },

  consultationDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },

  consultationActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  // Emergency
  emergencyView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  emergencyStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },

  emergencyStatCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  emergencyQueue: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },

  emergencyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '1rem'
  },

  emergencyPriority: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '100px'
  },

  priorityIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },

  emergencyInfo: {
    flex: 1
  },

  emergencyTime: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },

  takeChargeButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem'
  },

  // Suppliers
  suppliersView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },

  suppliersList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem'
  },

  supplierCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  supplierHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },

  supplierDetails: {
    fontSize: '0.875rem',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },

  supplierActions: {
    display: 'flex',
    gap: '0.5rem'
  },

  // Resources
  resourcesView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  resourceTabs: {
    display: 'flex',
    gap: '1rem',
    borderBottom: '1px solid #e5e7eb'
  },

  activeTab: {
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid #2563eb',
    color: '#2563eb',
    fontWeight: '500',
    cursor: 'pointer'
  },

  tab: {
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer'
  },

  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },

  resourceCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  resourceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  },

  resourceDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },

  // Notifications
  notificationsView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  notificationCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  notificationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem'
  },

  notificationTime: {
    fontSize: '0.75rem',
    color: '#9ca3af'
  },

  notificationActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem'
  },

  // Placeholder pour les vues non implémentées
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    color: '#6b7280',
    textAlign: 'center',
    gap: '1rem'
  }
};

export default SanteAIAdmin;