# 🐳 Odoo 19 – Environnement Docker (Tutoriel Odoo – Module Estate)

Ce dépôt présente un **environnement Odoo 19 prêt à l’emploi**, basé sur **Docker et Docker Compose**, mis en place dans le cadre du **tutoriel officiel Odoo** pour l’apprentissage du développement de modules, notamment le module **Estate**.

L’objectif est de démontrer la mise en place d’un **setup propre, sécurisé et reproductible**, conforme aux **bonnes pratiques professionnelles**.

---

## 🎯 Objectifs

- Suivre le **tutoriel officiel Odoo** (développement de modules)
- Mettre en place un environnement **Odoo 19 + PostgreSQL** avec Docker
- Appliquer de bonnes pratiques **Git / Docker / sécurité**
- Servir de base pour le développement du module **Estate**

---

## 📚 Référence

Tutoriel officiel Odoo :  
👉 https://www.odoo.com/documentation/19.0/developer/tutorials/getting_started.html

---

## 📦 Contenu du dépôt

```text
.
├── docker-compose.yml
├── .gitignore
└── README.md
Les fichiers sensibles (.env, odoo.conf) ainsi que les dossiers d’addons ne sont pas versionnés.

⚙️ Lancement rapide
bash
Copier le code
docker-compose up -d
Odoo est ensuite accessible sur :
👉 http://localhost:8069

📂 Module Estate
Le module Estate, développé en suivant le tutoriel officiel Odoo, est monté dans le conteneur via Docker à l’emplacement :

bash
Copier le code
/mnt/extra-addons
🔐 Bonnes pratiques
Aucun secret versionné

Configuration reproductible

Dépôt compatible avec un usage public GitHub

Approche alignée avec un contexte professionnel / PSF

🧑‍💻 Auteur
Helia
Projet d’apprentissage et de mise en pratique professionnelle
(Odoo · Docker · Git)

markdown
Copier le code


