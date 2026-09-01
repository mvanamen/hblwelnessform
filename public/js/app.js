/* HerbaForms — SPA (vanilla JS, hash-router, i18n NL/EN) */
(function () {
  'use strict';

  const $app = document.getElementById('app');
  const state = { user: null, profile: null };

  // ============================================================
  // i18n
  // ============================================================

  const STR = {
    nl: {
      'tagline': 'Jouw voortgang, samen met je coach.',
      'login.email': 'E-mailadres', 'login.password': 'Wachtwoord', 'login.submit': 'Inloggen',
      'login.placeholder.email': 'jij@voorbeeld.nl',
      'force.title': 'Nieuw wachtwoord',
      'force.intro': 'Welkom {name}! Kies eerst een eigen wachtwoord om verder te gaan.',
      'force.current': 'Huidig (tijdelijk) wachtwoord', 'force.next': 'Nieuw wachtwoord',
      'force.hint': 'Minimaal 8 tekens.', 'force.submit': 'Opslaan en doorgaan',
      'force.success': 'Wachtwoord ingesteld — welkom!',
      'nav.overview': 'Overzicht', 'nav.checkin': 'Check-in', 'nav.history': 'Historie',
      'nav.profile': 'Profiel', 'nav.members': 'Deelnemers', 'nav.settings': 'Instellingen',
      'nav.team': 'Team',
      'role.admin': 'Beheerder', 'role.coach': 'Coach', 'role.member': 'Deelnemer',
      'btn.logout': 'Uitloggen', 'btn.cancel': 'Annuleren', 'btn.save': 'Opslaan',
      'btn.view': 'Bekijk', 'btn.edit': 'Bewerk', 'btn.delete': 'Verwijder',
      'btn.done': 'Klaar', 'btn.create': 'Account aanmaken', 'btn.resetpw': 'Reset wachtwoord',
      'btn.copy': 'Kopieer wachtwoord',
      'loading': 'Laden…',
      'toast.copied': 'Gekopieerd naar klembord', 'toast.copyfail': 'Kopiëren niet gelukt — noteer het handmatig',
      'toast.saved': 'Opgeslagen ✔',
      'theme.dark': 'Donker thema', 'theme.light': 'Licht thema', 'theme.auto': 'Thema volgt systeem',
      'theme.switch': 'Thema wisselen (licht / donker / systeem)',
      'greet.night': 'Goedenacht', 'greet.morning': 'Goedemorgen', 'greet.afternoon': 'Goedemiddag', 'greet.evening': 'Goedenavond',
      'home.sub.some': 'Je hebt {n} check-in(s) gedaan. Blijf zo doorgaan!',
      'home.sub.none': 'Tijd voor je eerste check-in!',
      'home.newcheckin': '+ Nieuwe check-in',
      'home.intake.title': 'Maak je profiel compleet',
      'home.intake.sub': 'Vul je startgewicht en doel in, dan kunnen we je voortgang laten zien.',
      'home.intake.btn': 'Profiel invullen',
      'home.progress.title': 'Op weg naar je doel', 'home.progress.sub': 'Van {a} naar {b} kg',
      'tile.weight': 'Huidig gewicht', 'tile.togo': 'Nog te gaan', 'tile.energy': 'Energie (14 dagen)',
      'tile.checkins': 'Check-ins', 'tile.goalweight': 'Doelgewicht', 'tile.energy.short': 'Energie (14 dgn)',
      'tile.lastcheckin': 'Laatste check-in',
      'chart.weight': 'Gewicht', 'chart.weight.sub': 'in kilogram',
      'chart.energy': 'Energie', 'chart.energy.sub': 'score van 1 tot 10',
      'chart.goal': 'doel', 'chart.empty': 'Nog geen metingen — vul je eerste check-in in.',
      'home.recent': 'Laatste check-ins', 'home.viewall': 'Alles bekijken',
      'home.nocheckins': 'Nog geen check-ins.',
      'home.coach': 'Jouw coach', 'home.coach.msg': 'Vragen over je voortgang? Neem gerust contact op.',
      'home.nocoach': 'Er is nog geen coach aan je gekoppeld.',
      'energy.label': 'energie',
      'ci.title': 'Check-in',
      'ci.sub': 'Vul in hoe het vandaag met je gaat. Alleen datum is verplicht — de rest mag leeg.',
      'ci.date': 'Datum', 'ci.weight': 'Gewicht (kg)', 'ci.energy': 'Energie vandaag',
      'ci.energy.hint': '1 = uitgeput · 10 = bruisend van de energie',
      'ci.mood': 'Stemming', 'ci.sleep': 'Slaap (uren)', 'ci.water': 'Water (liter)',
      'ci.notes': 'Notities', 'ci.notes.ph': 'Hoe ging het vandaag? Bijzonderheden?',
      'ci.submit': 'Check-in opslaan', 'ci.saved': 'Check-in opgeslagen 💪',
      'ci.ph.weight': 'bijv. 82,5', 'ci.ph.sleep': 'bijv. 7,5', 'ci.ph.water': 'bijv. 2',
      'hist.title': 'Historie', 'hist.sub': 'Al je check-ins op een rij.',
      'hist.confirm.title': 'Check-in verwijderen',
      'hist.confirm.text': 'Weet je zeker dat je deze check-in wilt verwijderen?',
      'hist.deleted': 'Check-in verwijderd',
      'th.date': 'Datum', 'th.weight': 'Gewicht', 'th.energy': 'Energie', 'th.sleep': 'Slaap',
      'th.water': 'Water', 'th.mood': 'Humeur', 'th.notes': 'Notities', 'th.status': 'Status',
      'th.member': 'Deelnemer', 'th.coach': 'Coach', 'th.lastcheckin': 'Laatste check-in',
      'th.members': 'Deelnemers', 'th.admin': 'Beheerder',
      'pr.title': 'Mijn profiel', 'pr.sub': 'Deze gegevens gebruikt je coach om je goed te begeleiden.',
      'pr.birthdate': 'Geboortedatum', 'pr.height': 'Lengte (cm)', 'pr.startweight': 'Startgewicht (kg)',
      'pr.goalweight': 'Doelgewicht (kg)', 'pr.activity': 'Hoe actief ben je?', 'pr.choose': 'Maak een keuze',
      'pr.goal': 'Wat is je doel?', 'pr.goal.ph': 'bijv. fitter worden, afvallen…',
      'pr.health': 'Gezondheid & bijzonderheden', 'pr.health.ph': 'Allergieën, blessures, medicatie… (optioneel)',
      'pr.submit': 'Profiel opslaan', 'pr.saved': 'Profiel opgeslagen ✔',
      'act.low': 'Weinig actief', 'act.light': 'Licht actief', 'act.medium': 'Gemiddeld actief',
      'act.high': 'Erg actief', 'act.athlete': 'Topsporter',
      'pw.title': 'Wachtwoord wijzigen', 'pw.current': 'Huidig wachtwoord', 'pw.next': 'Nieuw wachtwoord',
      'pw.submit': 'Wachtwoord wijzigen', 'pw.changed': 'Wachtwoord gewijzigd ✔',
      'in.required': 'Velden met * zijn verplicht.',
      'in.s.personal': 'Persoonlijke gegevens', 'in.s.address': 'Adres', 'in.s.measure': 'Metingen',
      'in.s.goal': 'Jouw doel', 'in.s.habits': 'Gewoonten',
      'in.first': 'Voornaam', 'in.surname': 'Achternaam',
      'in.facebook': 'Facebooknaam', 'in.facebook.hint': 'Geen Facebook? Typ "none".',
      'in.phone': 'Telefoon', 'in.whatsapp': 'WhatsApp',
      'in.street': 'Straatnaam', 'in.street.hint': 'Geen postbus.',
      'in.number': 'Huisnummer', 'in.zip': 'Postcode', 'in.suburb': 'Wijk',
      'in.city': 'Woonplaats', 'in.province': 'Provincie', 'in.country': 'Land',
      'in.gender': 'Geslacht', 'gender.male': 'Man', 'gender.female': 'Vrouw',
      'in.weight': 'Gewicht (kg)', 'in.waist': 'Taille (cm)', 'in.waist.hint': 'In centimeters.',
      'in.energy': 'Energieniveau',
      'in.goaltype': 'Wat is je doel?', 'goal.health': 'Gezondheid', 'goal.gain': 'Aankomen', 'goal.lose': 'Afvallen',
      'in.goaldesc': 'Omschrijf je doel', 'in.reason': 'Reden',
      'in.goalweight.hint': 'Optioneel — voor de voortgangsgrafiek.',
      'in.tried': 'Wat heb je eerder geprobeerd en waarom werkte het niet voor jou?',
      'in.meals': 'Eet je drie maaltijden per dag? Zo niet, welke sla je over?',
      'in.snack': 'Snack je? Zo ja, wat snack je?',
      'in.eatout': 'Hoe vaak per week eet je buiten de deur?',
      'in.water': 'Hoeveel water drink je per dag?',
      'in.drinks': 'Wat drink je verder?',
      'drink.tea': 'Thee', 'drink.coffee': 'Koffie', 'drink.energydrink': 'Energiedrank',
      'drink.soda': 'Frisdrank', 'drink.other': 'Anders',
      'in.otherdrink': 'Bij "anders": wat drink je?',
      'in.tired': 'Wanneer ben je het meest moe?',
      'in.hungry': 'Wanneer heb je de meeste honger?',
      'in.medication': 'Gebruik je medicatie? Zo ja, omschrijf',
      'badge.none': 'nog geen check-in', 'badge.active': 'actief', 'badge.silent': '{n} dgn stil',
      'badge.inactive': 'inactief', 'badge.nocoach': 'geen coach',
      'co.title': 'Mijn deelnemers', 'co.sub': '{n} deelnemer(s) gekoppeld aan jou.',
      'co.new': '+ Nieuwe deelnemer', 'co.search': 'Zoek op naam of e-mail…',
      'co.empty': 'Nog geen deelnemers. Voeg je eerste deelnemer toe!',
      'co.back': '← Terug naar overzicht', 'co.since': 'lid sinds {d}',
      'co.intake': 'Intake', 'co.intake.empty': 'Intake is nog niet ingevuld.',
      'co.notes': 'Coachnotities', 'co.notes.sub': 'Alleen zichtbaar voor coaches',
      'co.notes.ph': 'Nieuwe notitie…', 'co.notes.empty': 'Nog geen notities.',
      'co.allcheckins': 'Alle check-ins',
      'co.resetpw.title': 'Wachtwoord resetten',
      'co.resetpw.text': '{name} krijgt een nieuw tijdelijk wachtwoord en moet dit bij de volgende login wijzigen.',
      'co.resetpw.btn': 'Resetten', 'co.resetpw.result': 'Nieuw tijdelijk wachtwoord',
      'modal.newmember': 'Nieuwe deelnemer', 'modal.name': 'Naam', 'modal.name.ph': 'Voor- en achternaam',
      'modal.email.ph': 'deelnemer@voorbeeld.nl', 'modal.coach': 'Koppel aan coach', 'modal.nocoach': '— Geen coach —',
      'modal.created.title': 'Account aangemaakt 🎉',
      'modal.created.text': '{name} kan nu inloggen met {email} en dit tijdelijke wachtwoord:',
      'modal.temppw.note': 'Tijdelijk wachtwoord — deel dit veilig. Bij de eerste login moet het gewijzigd worden.',
      'modal.edit.title': '{name} bewerken', 'modal.status': 'Status',
      'modal.active': 'Actief', 'modal.inactive': 'Inactief (kan niet inloggen)',
      'ad.title': 'Overzicht', 'ad.sub': 'Zo staat je community ervoor.',
      'ad.tile.members': 'Actieve deelnemers', 'ad.tile.coaches': 'Coaches',
      'ad.tile.checkins': 'Check-ins deze week', 'ad.tile.active': 'Actief deze week', 'ad.of': 'van {n}',
      'ad.unassigned': '⚠️ {n} deelnemer(s) zonder coach.', 'ad.unassigned.link': 'Koppel ze via',
      'ad.attention': 'Aandacht nodig', 'ad.attention.sub': 'Deelnemers zonder check-in in de afgelopen 7 dagen',
      'ad.attention.empty': 'Iedereen heeft recent ingecheckt!',
      'ad.members.title': 'Deelnemers', 'ad.members.sub': '{n} deelnemers in totaal.',
      'ad.members.search': 'Zoek op naam, e-mail of coach…', 'ad.members.empty': 'Geen deelnemers gevonden.',
      'ad.team.sub': 'Coaches en beheerders van het platform.',
      'ad.coaches.title': 'Coaches', 'ad.coaches.new': '+ Nieuwe coach',
      'ad.coaches.empty': 'Nog geen coaches. Maak de eerste aan!',
      'ad.admins.title': 'Beheerders', 'ad.admins.new': '+ Nieuwe beheerder',
      'ad.admins.sub': 'Beheerders kunnen alles beheren, ook andere beheerders.',
      'modal.newcoach': 'Nieuwe coach', 'modal.newadmin': 'Nieuwe beheerder',
      'modal.created.coach': '{name} kan inloggen met {email}:',
      'set.title': 'Instellingen', 'set.display': 'Weergave', 'set.lang': 'Taal',
      'lang.nl': 'Nederlands', 'lang.en': 'Engels',
      'you': 'jij',
      'err.missing_credentials': 'Vul e-mail en wachtwoord in',
      'err.invalid_credentials': 'Onjuiste inloggegevens',
      'err.not_logged_in': 'Je bent niet (meer) ingelogd',
      'err.forbidden': 'Geen toegang',
      'err.password_too_short': 'Nieuw wachtwoord moet minimaal 8 tekens zijn',
      'err.wrong_current_password': 'Het huidige wachtwoord klopt niet — controleer het en probeer opnieuw',
      'err.invalid_date': 'Ongeldige datum',
      'err.member_not_found': 'Deelnemer niet gevonden',
      'err.empty_note': 'Notitie is leeg',
      'err.invalid_role': 'Ongeldige rol',
      'err.user_not_found': 'Gebruiker niet gevonden',
      'err.cannot_deactivate_self': 'Je kunt jezelf niet deactiveren',
      'err.email_in_use': 'E-mailadres is al in gebruik',
      'err.name_email_required': 'Naam en geldig e-mailadres zijn verplicht',
      'err.generic': 'Er ging iets mis',
    },
    en: {
      'tagline': 'Your progress, together with your coach.',
      'login.email': 'Email address', 'login.password': 'Password', 'login.submit': 'Sign in',
      'login.placeholder.email': 'you@example.com',
      'force.title': 'New password',
      'force.intro': 'Welcome {name}! Please choose your own password to continue.',
      'force.current': 'Current (temporary) password', 'force.next': 'New password',
      'force.hint': 'At least 8 characters.', 'force.submit': 'Save and continue',
      'force.success': 'Password set — welcome!',
      'nav.overview': 'Overview', 'nav.checkin': 'Check-in', 'nav.history': 'History',
      'nav.profile': 'Profile', 'nav.members': 'Members', 'nav.settings': 'Settings',
      'nav.team': 'Team',
      'role.admin': 'Administrator', 'role.coach': 'Coach', 'role.member': 'Member',
      'btn.logout': 'Sign out', 'btn.cancel': 'Cancel', 'btn.save': 'Save',
      'btn.view': 'View', 'btn.edit': 'Edit', 'btn.delete': 'Delete',
      'btn.done': 'Done', 'btn.create': 'Create account', 'btn.resetpw': 'Reset password',
      'btn.copy': 'Copy password',
      'loading': 'Loading…',
      'toast.copied': 'Copied to clipboard', 'toast.copyfail': 'Copying failed — please note it down manually',
      'toast.saved': 'Saved ✔',
      'theme.dark': 'Dark theme', 'theme.light': 'Light theme', 'theme.auto': 'Theme follows system',
      'theme.switch': 'Switch theme (light / dark / system)',
      'greet.night': 'Good night', 'greet.morning': 'Good morning', 'greet.afternoon': 'Good afternoon', 'greet.evening': 'Good evening',
      'home.sub.some': 'You have completed {n} check-in(s). Keep it up!',
      'home.sub.none': 'Time for your first check-in!',
      'home.newcheckin': '+ New check-in',
      'home.intake.title': 'Complete your profile',
      'home.intake.sub': 'Fill in your starting weight and goal so we can show your progress.',
      'home.intake.btn': 'Fill in profile',
      'home.progress.title': 'On your way to your goal', 'home.progress.sub': 'From {a} to {b} kg',
      'tile.weight': 'Current weight', 'tile.togo': 'To go', 'tile.energy': 'Energy (14 days)',
      'tile.checkins': 'Check-ins', 'tile.goalweight': 'Goal weight', 'tile.energy.short': 'Energy (14 days)',
      'tile.lastcheckin': 'Last check-in',
      'chart.weight': 'Weight', 'chart.weight.sub': 'in kilograms',
      'chart.energy': 'Energy', 'chart.energy.sub': 'score from 1 to 10',
      'chart.goal': 'goal', 'chart.empty': 'No measurements yet — complete your first check-in.',
      'home.recent': 'Recent check-ins', 'home.viewall': 'View all',
      'home.nocheckins': 'No check-ins yet.',
      'home.coach': 'Your coach', 'home.coach.msg': 'Questions about your progress? Feel free to get in touch.',
      'home.nocoach': 'No coach has been linked to you yet.',
      'energy.label': 'energy',
      'ci.title': 'Check-in',
      'ci.sub': 'Tell us how you are doing today. Only the date is required — everything else is optional.',
      'ci.date': 'Date', 'ci.weight': 'Weight (kg)', 'ci.energy': 'Energy today',
      'ci.energy.hint': '1 = exhausted · 10 = bursting with energy',
      'ci.mood': 'Mood', 'ci.sleep': 'Sleep (hours)', 'ci.water': 'Water (litres)',
      'ci.notes': 'Notes', 'ci.notes.ph': 'How did today go? Anything special?',
      'ci.submit': 'Save check-in', 'ci.saved': 'Check-in saved 💪',
      'ci.ph.weight': 'e.g. 82.5', 'ci.ph.sleep': 'e.g. 7.5', 'ci.ph.water': 'e.g. 2',
      'hist.title': 'History', 'hist.sub': 'All your check-ins in one place.',
      'hist.confirm.title': 'Delete check-in',
      'hist.confirm.text': 'Are you sure you want to delete this check-in?',
      'hist.deleted': 'Check-in deleted',
      'th.date': 'Date', 'th.weight': 'Weight', 'th.energy': 'Energy', 'th.sleep': 'Sleep',
      'th.water': 'Water', 'th.mood': 'Mood', 'th.notes': 'Notes', 'th.status': 'Status',
      'th.member': 'Member', 'th.coach': 'Coach', 'th.lastcheckin': 'Last check-in',
      'th.members': 'Members', 'th.admin': 'Administrator',
      'pr.title': 'My profile', 'pr.sub': 'Your coach uses this information to support you well.',
      'pr.birthdate': 'Date of birth', 'pr.height': 'Height (cm)', 'pr.startweight': 'Starting weight (kg)',
      'pr.goalweight': 'Goal weight (kg)', 'pr.activity': 'How active are you?', 'pr.choose': 'Select an option',
      'pr.goal': 'What is your goal?', 'pr.goal.ph': 'e.g. get fitter, lose weight…',
      'pr.health': 'Health & particulars', 'pr.health.ph': 'Allergies, injuries, medication… (optional)',
      'pr.submit': 'Save profile', 'pr.saved': 'Profile saved ✔',
      'act.low': 'Not very active', 'act.light': 'Lightly active', 'act.medium': 'Moderately active',
      'act.high': 'Very active', 'act.athlete': 'Athlete',
      'pw.title': 'Change password', 'pw.current': 'Current password', 'pw.next': 'New password',
      'pw.submit': 'Change password', 'pw.changed': 'Password changed ✔',
      'in.required': 'Fields marked * are required.',
      'in.s.personal': 'Personal details', 'in.s.address': 'Address', 'in.s.measure': 'Measurements',
      'in.s.goal': 'Your goal', 'in.s.habits': 'Habits',
      'in.first': 'First name', 'in.surname': 'Surname',
      'in.facebook': 'Facebook name', 'in.facebook.hint': 'If none, type "none".',
      'in.phone': 'Phone', 'in.whatsapp': 'WhatsApp',
      'in.street': 'Street name', 'in.street.hint': 'No mailbox allowed.',
      'in.number': 'House number', 'in.zip': 'Zip / postal code', 'in.suburb': 'Suburb',
      'in.city': 'City', 'in.province': 'Province', 'in.country': 'Country',
      'in.gender': 'Gender', 'gender.male': 'Male', 'gender.female': 'Female',
      'in.weight': 'Weight (kg)', 'in.waist': 'Waist (cm)', 'in.waist.hint': 'In centimetres.',
      'in.energy': 'Energy level',
      'in.goaltype': 'Your goal?', 'goal.health': 'Health', 'goal.gain': 'Gain weight', 'goal.lose': 'Lose weight',
      'in.goaldesc': 'Describe your goal', 'in.reason': 'Reason',
      'in.goalweight.hint': 'Optional — used for the progress chart.',
      'in.tried': 'What have you tried before and why did it not work for you?',
      'in.meals': 'Do you take three meals a day? If not, which meals do you skip?',
      'in.snack': 'Do you snack? If yes, what do you snack on?',
      'in.eatout': 'How many times a week do you eat out?',
      'in.water': 'How much water do you drink daily?',
      'in.drinks': 'What else do you drink?',
      'drink.tea': 'Tea', 'drink.coffee': 'Coffee', 'drink.energydrink': 'Energy drink',
      'drink.soda': 'Soda', 'drink.other': 'Other',
      'in.otherdrink': 'In case of "other": what do you drink?',
      'in.tired': 'When are you most tired?',
      'in.hungry': 'When are you most hungry?',
      'in.medication': 'Do you take medication? If so, describe',
      'badge.none': 'no check-in yet', 'badge.active': 'active', 'badge.silent': 'quiet for {n} days',
      'badge.inactive': 'inactive', 'badge.nocoach': 'no coach',
      'co.title': 'My members', 'co.sub': '{n} member(s) linked to you.',
      'co.new': '+ New member', 'co.search': 'Search by name or email…',
      'co.empty': 'No members yet. Add your first member!',
      'co.back': '← Back to overview', 'co.since': 'member since {d}',
      'co.intake': 'Intake', 'co.intake.empty': 'Intake has not been filled in yet.',
      'co.notes': 'Coach notes', 'co.notes.sub': 'Only visible to coaches',
      'co.notes.ph': 'New note…', 'co.notes.empty': 'No notes yet.',
      'co.allcheckins': 'All check-ins',
      'co.resetpw.title': 'Reset password',
      'co.resetpw.text': '{name} will get a new temporary password and must change it at the next sign-in.',
      'co.resetpw.btn': 'Reset', 'co.resetpw.result': 'New temporary password',
      'modal.newmember': 'New member', 'modal.name': 'Name', 'modal.name.ph': 'First and last name',
      'modal.email.ph': 'member@example.com', 'modal.coach': 'Link to coach', 'modal.nocoach': '— No coach —',
      'modal.created.title': 'Account created 🎉',
      'modal.created.text': '{name} can now sign in with {email} and this temporary password:',
      'modal.temppw.note': 'Temporary password — share it safely. It must be changed at first sign-in.',
      'modal.edit.title': 'Edit {name}', 'modal.status': 'Status',
      'modal.active': 'Active', 'modal.inactive': 'Inactive (cannot sign in)',
      'ad.title': 'Overview', 'ad.sub': 'How your community is doing.',
      'ad.tile.members': 'Active members', 'ad.tile.coaches': 'Coaches',
      'ad.tile.checkins': 'Check-ins this week', 'ad.tile.active': 'Active this week', 'ad.of': 'of {n}',
      'ad.unassigned': '⚠️ {n} member(s) without a coach.', 'ad.unassigned.link': 'Link them via',
      'ad.attention': 'Needs attention', 'ad.attention.sub': 'Members without a check-in in the past 7 days',
      'ad.attention.empty': 'Everyone has checked in recently!',
      'ad.members.title': 'Members', 'ad.members.sub': '{n} members in total.',
      'ad.members.search': 'Search by name, email or coach…', 'ad.members.empty': 'No members found.',
      'ad.team.sub': 'Coaches and administrators of the platform.',
      'ad.coaches.title': 'Coaches', 'ad.coaches.new': '+ New coach',
      'ad.coaches.empty': 'No coaches yet. Create the first one!',
      'ad.admins.title': 'Administrators', 'ad.admins.new': '+ New administrator',
      'ad.admins.sub': 'Administrators can manage everything, including other administrators.',
      'modal.newcoach': 'New coach', 'modal.newadmin': 'New administrator',
      'modal.created.coach': '{name} can sign in with {email}:',
      'set.title': 'Settings', 'set.display': 'Appearance', 'set.lang': 'Language',
      'lang.nl': 'Dutch', 'lang.en': 'English',
      'you': 'you',
      'err.missing_credentials': 'Please enter email and password',
      'err.invalid_credentials': 'Incorrect email or password',
      'err.not_logged_in': 'You are not signed in (anymore)',
      'err.forbidden': 'No access',
      'err.password_too_short': 'New password must be at least 8 characters',
      'err.wrong_current_password': 'The current password is incorrect — please check it and try again',
      'err.invalid_date': 'Invalid date',
      'err.member_not_found': 'Member not found',
      'err.empty_note': 'Note is empty',
      'err.invalid_role': 'Invalid role',
      'err.user_not_found': 'User not found',
      'err.cannot_deactivate_self': 'You cannot deactivate yourself',
      'err.email_in_use': 'Email address is already in use',
      'err.name_email_required': 'Name and a valid email address are required',
      'err.generic': 'Something went wrong',
    },
  };

  let LANG = localStorage.getItem('hf-lang') === 'en' ? 'en' : 'nl';
  document.documentElement.lang = LANG;

  function t(key, vars) {
    let s = STR[LANG][key] ?? STR.nl[key] ?? key;
    if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
    return s;
  }
  const tErr = (raw) => STR[LANG]['err.' + raw] ? t('err.' + raw) : (STR.nl['err.' + raw] ? t('err.' + raw) : (raw && raw.length < 80 && !raw.includes('_') ? raw : t('err.generic')));

  function setLang(l) {
    LANG = l === 'en' ? 'en' : 'nl';
    localStorage.setItem('hf-lang', LANG);
    document.documentElement.lang = LANG;
    route();
  }

  // ---------- thema ----------
  function applyTheme() {
    const th = localStorage.getItem('hf-theme');
    if (th === 'light' || th === 'dark') document.documentElement.dataset.theme = th;
    else delete document.documentElement.dataset.theme;
  }
  function cycleTheme() {
    const cur = localStorage.getItem('hf-theme');
    const next = cur === 'dark' ? 'light' : cur === 'light' ? null : 'dark';
    if (next) localStorage.setItem('hf-theme', next); else localStorage.removeItem('hf-theme');
    applyTheme();
    toast(next === 'dark' ? t('theme.dark') : next === 'light' ? t('theme.light') : t('theme.auto'));
  }
  applyTheme();

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const fmtNum = (v, d = 1) => v == null ? '—' :
    Number(v).toLocaleString(LANG === 'en' ? 'en-US' : 'nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: d });

  const fmtDate = (iso) => iso ? HFCharts.fmtDateLong(iso.slice(0, 10)) : '—';
  const today = () => new Date().toISOString().slice(0, 10);
  const daysAgo = (iso) => iso ? Math.floor((Date.now() - new Date(iso + 'T12:00:00')) / 864e5) : null;

  const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  async function api(path, opts = {}) {
    const res = await fetch('/api' + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Alleen bij écht sessieverlies terug naar het loginscherm — nooit bij
      // login- of wachtwoordfouten, anders raakt de gebruiker zijn context kwijt.
      if (res.status === 401 && !['/login', '/me', '/password'].includes(path)) {
        state.user = null; location.hash = '#/login'; route();
      }
      const err = new Error(tErr(data.error));
      err.code = data.error;
      throw err;
    }
    return data;
  }

  function toast(msg, isError = false) {
    const root = document.getElementById('toast-root');
    const el = document.createElement('div');
    el.className = 'toast' + (isError ? ' error' : '');
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 2600);
    setTimeout(() => el.remove(), 3000);
  }

  function modal(html) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-backdrop"><div class="modal">${html}</div></div>`;
    const backdrop = root.firstElementChild;
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });
    document.addEventListener('keydown', escClose);
    return backdrop.firstElementChild;
  }
  function escClose(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
    document.removeEventListener('keydown', escClose);
  }

  function confirmModal(title, text, confirmLabel) {
    return new Promise((resolve) => {
      const m = modal(`
        <h3>${esc(title)}</h3>
        <p style="color:var(--ink-2)">${esc(text)}</p>
        <div class="modal-actions">
          <button class="btn ghost" data-x="no">${t('btn.cancel')}</button>
          <button class="btn danger" data-x="yes">${esc(confirmLabel || t('btn.delete'))}</button>
        </div>`);
      m.querySelector('[data-x="no"]').onclick = () => { closeModal(); resolve(false); };
      m.querySelector('[data-x="yes"]').onclick = () => { closeModal(); resolve(true); };
    });
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast(t('toast.copied')); }
    catch { toast(t('toast.copyfail'), true); }
  }

  function passwordRevealHTML(password) {
    return `
      <div class="password-reveal">
        <code>${esc(password)}</code>
        <p>${t('modal.temppw.note')}</p>
      </div>
      <button class="btn ghost" data-copy>${t('btn.copy')}</button>`;
  }

  function tempPasswordModal(res, onDone) {
    const m = modal(`
      <h3>${t('modal.created.title')}</h3>
      <p style="color:var(--ink-2)">${t('modal.created.text', { name: esc(res.user.name), email: `<b>${esc(res.user.email)}</b>` })}</p>
      ${passwordRevealHTML(res.password)}
      <div class="modal-actions"><button class="btn" data-done>${t('btn.done')}</button></div>`);
    m.querySelector('[data-copy]').onclick = () => copyText(res.password);
    m.querySelector('[data-done]').onclick = () => { closeModal(); if (onDone) onDone(); };
  }

  // ---------- iconen ----------
  const I = {
    home: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    plus: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
    clock: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    user: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    users: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1.2-3.4 3.7-5 6.5-5s5.3 1.6 6.5 5"/><circle cx="17" cy="9" r="3"/><path d="M16.5 15.5c2.3.3 4.2 1.8 5 4.5"/></svg>',
    chart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20V4"/><path d="M4 20h16"/><path d="m7 14 4-5 3 3 5-7"/></svg>',
    gear: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1"/></svg>',
    out: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
    moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13A8.5 8.5 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>',
    globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"/></svg>',
    shield: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3z"/></svg>',
    leaf: '<svg width="20" height="20" viewBox="0 0 32 32"><path d="M16 25c-5-2-8-6-8-11 0-3 2-6 5-7 4-1 8 1 10 5-3-1-6 0-8 2s-3 5-2 8c.8 1.6 2 2.6 3 3z" fill="#17240a"/></svg>',
  };
  const logoHTML = `<div class="logo"><div class="logo-mark">${I.leaf}</div><div class="logo-name">Herba<span>Forms</span></div></div>`;

  // ---------- navigatie per rol ----------
  function navItems() {
    const r = state.user.role;
    if (r === 'member') return [
      { href: '#/', label: t('nav.overview'), icon: I.home },
      { href: '#/checkin', label: t('nav.checkin'), icon: I.plus },
      { href: '#/historie', label: t('nav.history'), icon: I.clock },
      { href: '#/profiel', label: t('nav.profile'), icon: I.user },
    ];
    if (r === 'coach') return [
      { href: '#/', label: t('nav.members'), icon: I.users },
      { href: '#/instellingen', label: t('nav.settings'), icon: I.gear },
    ];
    return [
      { href: '#/', label: t('nav.overview'), icon: I.chart },
      { href: '#/deelnemers', label: t('nav.members'), icon: I.users },
      { href: '#/team', label: t('nav.team'), icon: I.shield },
      { href: '#/instellingen', label: t('nav.settings'), icon: I.gear },
    ];
  }

  function shell(contentHTML) {
    const items = navItems();
    const cur = location.hash || '#/';
    const link = (n) =>
      `<a href="${n.href}" class="${cur === n.href ? 'active' : ''}">${n.icon}<span>${esc(n.label)}</span></a>`;
    $app.innerHTML = `
      <div class="shell">
        <aside class="sidebar">
          ${logoHTML}
          <nav class="nav">${items.map(link).join('')}</nav>
          <div class="sidebar-footer">
            <div class="user-chip">
              <div class="avatar">${esc(initials(state.user.name))}</div>
              <div><b>${esc(state.user.name)}</b><small>${t('role.' + state.user.role)}</small></div>
            </div>
            <div class="sidebar-actions">
              <button class="icon-btn" data-theme-toggle title="${t('theme.switch')}">${I.moon}</button>
              <button class="icon-btn" data-lang-toggle title="${t('set.lang')}">${I.globe} ${LANG === 'nl' ? 'EN' : 'NL'}</button>
              <button class="icon-btn" data-logout title="${t('btn.logout')}">${I.out}</button>
            </div>
          </div>
        </aside>
        <div>
          <header class="topbar">
            ${logoHTML}
            <div class="topbar-actions">
              <button class="icon-btn" data-theme-toggle title="${t('theme.switch')}">${I.moon}</button>
              <button class="icon-btn" data-lang-toggle title="${t('set.lang')}">${LANG === 'nl' ? 'EN' : 'NL'}</button>
              <button class="icon-btn" data-logout title="${t('btn.logout')}">${I.out}</button>
            </div>
          </header>
          <main class="main"><div class="main-inner">${contentHTML}</div></main>
          <nav class="tabbar">${items.map(link).join('')}</nav>
        </div>
      </div>`;
    $app.querySelectorAll('[data-logout]').forEach((b) => b.onclick = logout);
    $app.querySelectorAll('[data-theme-toggle]').forEach((b) => b.onclick = cycleTheme);
    $app.querySelectorAll('[data-lang-toggle]').forEach((b) => b.onclick = () => setLang(LANG === 'nl' ? 'en' : 'nl'));
    return $app.querySelector('.main-inner');
  }

  async function logout() {
    await api('/logout', { method: 'POST' }).catch(() => {});
    state.user = null; state.profile = null;
    location.hash = '#/login';
    route();
  }

  // ---------- statistiek-helpers ----------
  function weightSeries(checkins) {
    return checkins.filter((c) => c.weight != null).map((c) => ({ date: c.date, value: c.weight }));
  }
  function energySeries(checkins) {
    return checkins.filter((c) => c.energy != null).map((c) => ({ date: c.date, value: c.energy }));
  }
  function memberStats(profile, checkins) {
    const w = weightSeries(checkins);
    const start = profile?.start_weight ?? (w.length ? w[0].value : null);
    const current = w.length ? w[w.length - 1].value : start;
    const goal = profile?.goal_weight ?? null;
    const delta = current != null && start != null ? current - start : null;
    const cutoff = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
    const recent = checkins.filter((c) => c.date >= cutoff && c.energy != null);
    const energyAvg = recent.length ? recent.reduce((s, c) => s + c.energy, 0) / recent.length : null;
    let progress = null;
    if (start != null && goal != null && current != null && Math.abs(start - goal) > 0.01) {
      progress = Math.max(0, Math.min(100, ((start - current) / (start - goal)) * 100));
    }
    return { current, start, goal, delta, energyAvg, progress, count: checkins.length };
  }

  function deltaHTML(delta, { goodWhenDown = true, unit = 'kg', d = 1 } = {}) {
    if (delta == null || Math.abs(delta) < 0.001) return '<span class="tile-delta flat">± 0</span>';
    const down = delta < 0;
    const good = goodWhenDown ? down : !down;
    const arrow = down ? '▾' : '▴';
    return `<span class="tile-delta ${good ? 'good' : 'bad'}">${arrow} ${fmtNum(Math.abs(delta), d)} ${unit}</span>`;
  }

  const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

  function chartOpts() {
    return { goalLabel: t('chart.goal'), emptyText: t('chart.empty') };
  }

  function renderCharts(root, checkins, goal) {
    HFCharts.lineChart(root.querySelector('#chart-weight'), {
      points: weightSeries(checkins), colorVar: '--series-weight', unit: 'kg',
      name: t('chart.weight'), goal, decimals: 1, ...chartOpts(),
    });
    HFCharts.lineChart(root.querySelector('#chart-energy'), {
      points: energySeries(checkins), colorVar: '--series-energy', unit: '/10',
      name: t('chart.energy'), decimals: 0, yMin: 0, yMax: 11, ...chartOpts(),
    });
  }

  const chartCardsHTML = () => `
      <div class="grid-2">
        <div class="card"><div class="card-head"><div>
          <div class="card-title">${t('chart.weight')}</div><div class="card-sub">${t('chart.weight.sub')}</div></div></div>
          <div id="chart-weight"></div></div>
        <div class="card"><div class="card-head"><div>
          <div class="card-title">${t('chart.energy')}</div><div class="card-sub">${t('chart.energy.sub')}</div></div></div>
          <div id="chart-energy"></div></div>
      </div>`;

  const langToggleHTML = () => `
    <div class="section-tabs" style="justify-content:center">
      <button data-lang="nl" class="${LANG === 'nl' ? 'on' : ''}">🇳🇱 ${t('lang.nl')}</button>
      <button data-lang="en" class="${LANG === 'en' ? 'on' : ''}">🇬🇧 ${t('lang.en')}</button>
    </div>`;
  const bindLangToggle = (root) =>
    root.querySelectorAll('[data-lang]').forEach((b) => b.onclick = () => setLang(b.dataset.lang));

  // ============================================================
  // Views
  // ============================================================

  function loginView(err = '') {
    $app.innerHTML = `
      <div class="login-wrap">
        <div style="display:flex;flex-direction:column;gap:14px;width:min(410px,100%)">
        <div class="login-card">
          <div class="login-brand">
            <div class="logo-mark">${I.leaf}</div>
            <h1>Herba<span style="color:var(--brand)">Forms</span></h1>
            <p>${t('tagline')}</p>
          </div>
          ${err ? `<div class="form-error">${esc(err)}</div>` : ''}
          <form id="login-form" style="display:flex;flex-direction:column;gap:14px">
            <div class="field"><label>${t('login.email')}</label>
              <input class="input" name="email" type="email" required autocomplete="email" placeholder="${t('login.placeholder.email')}"></div>
            <div class="field"><label>${t('login.password')}</label>
              <input class="input" name="password" type="password" required autocomplete="current-password" placeholder="••••••••"></div>
            <button class="btn big" type="submit">${t('login.submit')}</button>
          </form>
        </div>
        ${langToggleHTML()}
        </div>
      </div>`;
    bindLangToggle($app);
    document.getElementById('login-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const { user } = await api('/login', { method: 'POST', body: { email: f.get('email'), password: String(f.get('password')) } });
        state.user = user;
        if (location.hash && location.hash !== '#/') location.hash = '#/';
        else route();
      } catch (err) { loginView(err.message); }
    };
  }

  function forcePasswordView() {
    $app.innerHTML = `
      <div class="login-wrap">
        <div style="display:flex;flex-direction:column;gap:14px;width:min(410px,100%)">
        <div class="login-card">
          <div class="login-brand">
            <div class="logo-mark">${I.leaf}</div>
            <h1>${t('force.title')}</h1>
            <p>${t('force.intro', { name: esc(state.user.name) })}</p>
          </div>
          <div id="pw-err"></div>
          <form id="pw-form" style="display:flex;flex-direction:column;gap:14px">
            <div class="field"><label>${t('force.current')}</label>
              <input class="input" name="current" type="password" required autocomplete="current-password"></div>
            <div class="field"><label>${t('force.next')}</label>
              <input class="input" name="next" type="password" required minlength="8" autocomplete="new-password">
              <span class="hint">${t('force.hint')}</span></div>
            <button class="btn big" type="submit">${t('force.submit')}</button>
          </form>
        </div>
        ${langToggleHTML()}
        </div>
      </div>`;
    bindLangToggle($app);
    document.getElementById('pw-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const btn = e.target.querySelector('button[type=submit]');
      btn.disabled = true;
      try {
        await api('/password', { method: 'POST', body: {
          current: String(f.get('current')), next: String(f.get('next')).trim(),
        }});
        state.user.must_change_password = false;
        toast(t('force.success'));
        route();
      } catch (err) {
        btn.disabled = false;
        const box = document.getElementById('pw-err');
        if (box) box.innerHTML = `<div class="form-error">${esc(err.message)}</div>`;
        else toast(err.message, true);
      }
    };
  }

  // ---------- Deelnemer ----------

  async function memberHome() {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    const data = await api('/member/dashboard');
    state.profile = data.profile;
    const { profile, checkins, coach } = data;
    const s = memberStats(profile, checkins);
    const hour = new Date().getHours();
    const greet = hour < 6 ? t('greet.night') : hour < 12 ? t('greet.morning') : hour < 18 ? t('greet.afternoon') : t('greet.evening');
    const first = state.user.name.split(' ')[0];

    const intakePrompt = (!profile || !profile.completed) ? `
      <div class="card" style="border-color:var(--accent);background:var(--accent-soft)">
        <div class="card-head" style="margin-bottom:8px"><div>
          <div class="card-title">${t('home.intake.title')}</div>
          <div class="card-sub">${t('home.intake.sub')}</div>
        </div></div>
        <a class="btn" href="#/profiel">${t('home.intake.btn')}</a>
      </div>` : '';

    const progressCard = s.progress != null ? `
      <div class="card">
        <div class="card-head" style="margin-bottom:10px"><div>
          <div class="card-title">${t('home.progress.title')}</div>
          <div class="card-sub">${t('home.progress.sub', { a: fmtNum(s.start), b: fmtNum(s.goal) })}</div>
        </div><b style="font-size:18px">${Math.round(s.progress)}%</b></div>
        <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%"></div></div>
      </div>` : '';

    const recent = checkins.slice(-3).reverse();

    root.innerHTML = `
      <div class="page-head"><div>
        <h1>${greet}, ${esc(first)} 👋</h1>
        <p class="sub">${s.count ? t('home.sub.some', { n: s.count }) : t('home.sub.none')}</p>
      </div><a class="btn" href="#/checkin">${t('home.newcheckin')}</a></div>
      ${intakePrompt}
      <div class="tile-row">
        <div class="tile"><span class="tile-label">${t('tile.weight')}</span>
          <span class="tile-value">${fmtNum(s.current)}<small>kg</small></span>
          ${s.delta != null ? deltaHTML(s.delta, { goodWhenDown: s.goal == null || s.goal < s.start }) : ''}</div>
        <div class="tile"><span class="tile-label">${t('tile.togo')}</span>
          <span class="tile-value">${s.goal != null && s.current != null ? fmtNum(Math.abs(s.current - s.goal)) + '<small>kg</small>' : '—'}</span></div>
        <div class="tile"><span class="tile-label">${t('tile.energy')}</span>
          <span class="tile-value">${s.energyAvg != null ? fmtNum(s.energyAvg, 1) + '<small>/10</small>' : '—'}</span></div>
        <div class="tile"><span class="tile-label">${t('tile.checkins')}</span>
          <span class="tile-value">${s.count}</span></div>
      </div>
      ${progressCard}
      ${chartCardsHTML()}
      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div><div class="card-title">${t('home.recent')}</div></div>
            <a href="#/historie" style="font-size:13.5px;font-weight:650">${t('home.viewall')}</a></div>
          ${recent.length ? `<div class="list">${recent.map((c) => `
            <div class="list-item">
              <div><b style="font-size:14px">${fmtDate(c.date)}</b>
                <small style="display:block;color:var(--ink-3)">${c.mood ? MOODS[c.mood - 1] + ' · ' : ''}${c.energy != null ? t('energy.label') + ' ' + c.energy + '/10' : ''}</small></div>
              <b>${c.weight != null ? fmtNum(c.weight) + ' kg' : '—'}</b>
            </div>`).join('')}</div>`
          : `<div class="empty"><p>${t('home.nocheckins')}</p></div>`}
        </div>
        <div class="card">
          <div class="card-head"><div><div class="card-title">${t('home.coach')}</div></div></div>
          ${coach ? `<div class="person-row">
              <div class="avatar">${esc(initials(coach.name))}</div>
              <div class="who"><b>${esc(coach.name)}</b><small>${esc(coach.email)}</small></div>
            </div>
            <p style="color:var(--ink-2);font-size:13.5px;margin-top:12px">${t('home.coach.msg')}</p>`
          : `<div class="empty"><p>${t('home.nocoach')}</p></div>`}
        </div>
      </div>`;

    renderCharts(root, checkins, s.goal);
  }

  async function checkinView() {
    const root = shell('');
    let energy = null, mood = null;
    root.innerHTML = `
      <div class="page-head"><div><h1>${t('ci.title')}</h1>
        <p class="sub">${t('ci.sub')}</p></div></div>
      <form id="ci-form" class="card" style="display:flex;flex-direction:column;gap:18px">
        <div class="form-grid">
          <div class="field"><label>${t('ci.date')}</label>
            <input class="input" type="date" name="date" value="${today()}" max="${today()}" required></div>
          <div class="field"><label>${t('ci.weight')}</label>
            <input class="input" type="number" name="weight" step="0.1" min="20" max="400" inputmode="decimal" placeholder="${t('ci.ph.weight')}"></div>
          <div class="field full"><label>${t('ci.energy')}</label>
            <div class="chips" data-energy>${Array.from({ length: 10 }, (_, i) =>
              `<button type="button" class="chip" data-v="${i + 1}">${i + 1}</button>`).join('')}</div>
            <span class="hint">${t('ci.energy.hint')}</span></div>
          <div class="field full"><label>${t('ci.mood')}</label>
            <div class="chips" data-mood>${MOODS.map((m, i) =>
              `<button type="button" class="chip emoji" data-v="${i + 1}">${m}</button>`).join('')}</div></div>
          <div class="field"><label>${t('ci.sleep')}</label>
            <input class="input" type="number" name="sleep_hours" step="0.5" min="0" max="24" inputmode="decimal" placeholder="${t('ci.ph.sleep')}"></div>
          <div class="field"><label>${t('ci.water')}</label>
            <input class="input" type="number" name="water_l" step="0.1" min="0" max="15" inputmode="decimal" placeholder="${t('ci.ph.water')}"></div>
          <div class="field full"><label>${t('ci.notes')}</label>
            <textarea class="input" name="notes" placeholder="${t('ci.notes.ph')}"></textarea></div>
        </div>
        <button class="btn big" type="submit">${t('ci.submit')}</button>
      </form>`;

    const bindChips = (sel, set) => {
      root.querySelectorAll(`${sel} .chip`).forEach((c) => c.onclick = () => {
        const on = c.classList.contains('on');
        root.querySelectorAll(`${sel} .chip`).forEach((x) => x.classList.remove('on'));
        if (!on) { c.classList.add('on'); set(Number(c.dataset.v)); } else set(null);
      });
    };
    bindChips('[data-energy]', (v) => energy = v);
    bindChips('[data-mood]', (v) => mood = v);

    document.getElementById('ci-form').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        await api('/member/checkins', { method: 'POST', body: {
          date: f.get('date'), weight: f.get('weight'), energy, mood,
          sleep_hours: f.get('sleep_hours'), water_l: f.get('water_l'), notes: f.get('notes'),
        }});
        toast(t('ci.saved'));
        location.hash = '#/';
      } catch (err) { toast(err.message, true); }
    };
  }

  function checkinTable(checkins, { withDelete = false } = {}) {
    if (!checkins.length) return `<div class="empty"><div class="big-emoji">🗓️</div><p>${t('home.nocheckins')}</p></div>`;
    const rows = [...checkins].reverse().map((c) => `
      <tr>
        <td><b>${fmtDate(c.date)}</b></td>
        <td class="num">${c.weight != null ? fmtNum(c.weight) + ' kg' : '—'}</td>
        <td class="num">${c.energy != null ? c.energy + '/10' : '—'}</td>
        <td class="num">${c.sleep_hours != null ? fmtNum(c.sleep_hours) + ' u' : '—'}</td>
        <td class="num">${c.water_l != null ? fmtNum(c.water_l) + ' L' : '—'}</td>
        <td>${c.mood ? MOODS[c.mood - 1] : '—'}</td>
        <td style="white-space:normal;max-width:260px;color:var(--ink-2)">${esc(c.notes || '')}</td>
        ${withDelete ? `<td><button class="btn danger small" data-del="${c.id}">${t('btn.delete')}</button></td>` : ''}
      </tr>`).join('');
    return `<div class="table-wrap"><table class="table">
      <thead><tr><th>${t('th.date')}</th><th class="num">${t('th.weight')}</th><th class="num">${t('th.energy')}</th>
      <th class="num">${t('th.sleep')}</th><th class="num">${t('th.water')}</th><th>${t('th.mood')}</th><th>${t('th.notes')}</th>${withDelete ? '<th></th>' : ''}</tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  async function historyView() {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    const data = await api('/member/dashboard');
    const render = (checkins) => {
      root.innerHTML = `
        <div class="page-head"><div><h1>${t('hist.title')}</h1>
          <p class="sub">${t('hist.sub')}</p></div>
          <a class="btn" href="#/checkin">${t('home.newcheckin')}</a></div>
        <div class="card">${checkinTable(checkins, { withDelete: true })}</div>`;
      root.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
        if (!await confirmModal(t('hist.confirm.title'), t('hist.confirm.text'))) return;
        try {
          const res = await api(`/member/checkins/${b.dataset.del}`, { method: 'DELETE' });
          toast(t('hist.deleted'));
          render(res.checkins);
        } catch (err) { toast(err.message, true); }
      });
    };
    render(data.checkins);
  }

  const DRINK_CODES = ['tea', 'coffee', 'energydrink', 'soda', 'other'];
  const parseDrinks = (v) => { try { const a = JSON.parse(v || '[]'); return Array.isArray(a) ? a : []; } catch { return []; } };

  async function profileView() {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    const { profile } = await api('/me');
    const p = profile || {};
    const nameParts = state.user.name.split(' ');
    const firstDefault = p.first_name ?? nameParts[0];
    const surnameDefault = p.surname ?? nameParts.slice(1).join(' ');
    const drinks = new Set(parseDrinks(p.drinks));
    let gender = p.gender || null;
    let goalType = p.goal_type || null;
    let energyLevel = p.energy_level || null;

    const txt = (name, key, { req = false, hint = '', value = '', full = false, type = 'text', attrs = '' } = {}) => `
      <div class="field${full ? ' full' : ''}"><label>${t(key)}${req ? ' *' : ''}</label>
        <input class="input" type="${type}" name="${name}" value="${esc(value ?? '')}" ${req ? 'required' : ''} ${attrs}>
        ${hint ? `<span class="hint">${hint}</span>` : ''}</div>`;
    const area = (name, key, { req = false, value = '' } = {}) => `
      <div class="field full"><label>${t(key)}${req ? ' *' : ''}</label>
        <textarea class="input" name="${name}" ${req ? 'required' : ''}>${esc(value ?? '')}</textarea></div>`;
    const chipRow = (dataAttr, codes, prefix, selected, { multi = false } = {}) => `
      <div class="chips" ${dataAttr}>${codes.map((c) =>
        `<button type="button" class="chip" style="min-width:auto;padding:9px 16px" data-v="${c}"
          data-on="${multi ? (selected.has(c) ? 1 : 0) : (selected === c ? 1 : 0)}">${t(prefix + c)}</button>`).join('')}</div>`;
    const section = (key, inner) => `
      <div class="card" style="display:flex;flex-direction:column;gap:16px">
        <div class="card-title">${t(key)}</div>
        <div class="form-grid">${inner}</div>
      </div>`;

    root.innerHTML = `
      <div class="page-head"><div><h1>${t('pr.title')}</h1>
        <p class="sub">${t('pr.sub')} ${t('in.required')}</p></div></div>
      <form id="pr-form" style="display:flex;flex-direction:column;gap:18px">
        ${section('in.s.personal', `
          ${txt('first_name', 'in.first', { req: true, value: firstDefault })}
          ${txt('surname', 'in.surname', { req: true, value: surnameDefault })}
          ${txt('facebook_name', 'in.facebook', { req: true, value: p.facebook_name, hint: t('in.facebook.hint') })}
          ${txt('phone', 'in.phone', { req: true, value: p.phone, type: 'tel' })}
          ${txt('whatsapp', 'in.whatsapp', { value: p.whatsapp, type: 'tel' })}
          <div class="field"><label>${t('in.gender')} *</label>${chipRow('data-gender', ['male', 'female'], 'gender.', gender)}</div>
          ${txt('birthdate', 'pr.birthdate', { req: true, value: p.birthdate, type: 'date', attrs: `max="${today()}"` })}
        `)}
        ${section('in.s.address', `
          ${txt('street', 'in.street', { req: true, value: p.street, hint: t('in.street.hint') })}
          ${txt('house_number', 'in.number', { req: true, value: p.house_number })}
          ${txt('zipcode', 'in.zip', { value: p.zipcode })}
          ${txt('suburb', 'in.suburb', { value: p.suburb })}
          ${txt('city', 'in.city', { req: true, value: p.city })}
          ${txt('province', 'in.province', { value: p.province })}
          ${txt('country', 'in.country', { req: true, value: p.country })}
        `)}
        ${section('in.s.measure', `
          ${txt('height_cm', 'pr.height', { req: true, value: p.height_cm, type: 'number', attrs: 'step="0.5" min="100" max="250" inputmode="decimal"' })}
          ${txt('start_weight', 'in.weight', { req: true, value: p.start_weight, type: 'number', attrs: 'step="0.1" min="20" max="400" inputmode="decimal"' })}
          ${txt('waist_cm', 'in.waist', { req: true, value: p.waist_cm, hint: t('in.waist.hint'), type: 'number', attrs: 'step="0.5" min="30" max="250" inputmode="decimal"' })}
          <div class="field full"><label>${t('in.energy')} *</label>
            <div class="chips" data-energy>${Array.from({ length: 10 }, (_, i) =>
              `<button type="button" class="chip" data-v="${i + 1}" data-on="${energyLevel === i + 1 ? 1 : 0}">${i + 1}</button>`).join('')}</div>
            <span class="hint">${t('ci.energy.hint')}</span></div>
        `)}
        ${section('in.s.goal', `
          <div class="field full"><label>${t('in.goaltype')} *</label>${chipRow('data-goal', ['health', 'gain', 'lose'], 'goal.', goalType)}</div>
          ${area('goal_text', 'in.goaldesc', { req: true, value: p.goal_text })}
          ${area('reason', 'in.reason', { req: true, value: p.reason })}
          ${area('tried_before', 'in.tried', { req: true, value: p.tried_before })}
          ${txt('goal_weight', 'pr.goalweight', { value: p.goal_weight, hint: t('in.goalweight.hint'), type: 'number', attrs: 'step="0.1" min="20" max="400" inputmode="decimal"' })}
        `)}
        ${section('in.s.habits', `
          ${area('meals_day', 'in.meals', { req: true, value: p.meals_day })}
          ${area('snacking', 'in.snack', { req: true, value: p.snacking })}
          ${txt('eat_out', 'in.eatout', { req: true, value: p.eat_out })}
          ${txt('water_daily', 'in.water', { req: true, value: p.water_daily })}
          <div class="field full"><label>${t('in.drinks')}</label>${chipRow('data-drinks', DRINK_CODES, 'drink.', drinks, { multi: true })}</div>
          ${txt('other_drink', 'in.otherdrink', { value: p.other_drink })}
          ${txt('tired_when', 'in.tired', { req: true, value: p.tired_when })}
          ${txt('hungry_when', 'in.hungry', { req: true, value: p.hungry_when })}
          ${area('medication', 'in.medication', { req: true, value: p.medication ?? p.health_notes })}
        `)}
        <button class="btn big" type="submit">${t('pr.submit')}</button>
      </form>
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('pw.title')}</div></div></div>
        ${passwordFormHTML()}
      </div>`;

    // chips activeren (enkelvoudige en meervoudige selectie)
    root.querySelectorAll('[data-on="1"]').forEach((c) => c.classList.add('on'));
    const bindSingle = (sel, set) => root.querySelectorAll(`${sel} .chip`).forEach((c) => c.onclick = () => {
      root.querySelectorAll(`${sel} .chip`).forEach((x) => x.classList.remove('on'));
      c.classList.add('on'); set(c.dataset.v);
    });
    bindSingle('[data-gender]', (v) => gender = v);
    bindSingle('[data-goal]', (v) => goalType = v);
    bindSingle('[data-energy]', (v) => energyLevel = Number(v));
    root.querySelectorAll('[data-drinks] .chip').forEach((c) => c.onclick = () => {
      c.classList.toggle('on');
      if (c.classList.contains('on')) drinks.add(c.dataset.v); else drinks.delete(c.dataset.v);
    });

    document.getElementById('pr-form').onsubmit = async (e) => {
      e.preventDefault();
      if (!gender || !goalType || !energyLevel) { toast(t('in.required'), true); return; }
      const f = new FormData(e.target);
      const body = { gender, goal_type: goalType, energy_level: energyLevel, drinks: [...drinks] };
      for (const [k, v] of f.entries()) body[k] = v;
      try {
        const res = await api('/member/profile', { method: 'PUT', body });
        state.profile = res.profile;
        toast(t('pr.saved'));
        location.hash = '#/';
      } catch (err) { toast(err.message, true); }
    };
    bindPasswordForm(root);
  }

  function passwordFormHTML() {
    return `
      <form data-pwform class="form-grid">
        <div class="field"><label>${t('pw.current')}</label>
          <input class="input" name="current" type="password" required autocomplete="current-password"></div>
        <div class="field"><label>${t('pw.next')}</label>
          <input class="input" name="next" type="password" required minlength="8" autocomplete="new-password"></div>
        <div class="full"><button class="btn ghost" type="submit">${t('pw.submit')}</button></div>
      </form>`;
  }
  function bindPasswordForm(root) {
    const form = root.querySelector('[data-pwform]');
    if (!form) return;
    form.onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(form);
      try {
        await api('/password', { method: 'POST', body: { current: String(f.get('current')), next: String(f.get('next')).trim() } });
        toast(t('pw.changed'));
        form.reset();
      } catch (err) { toast(err.message, true); }
    };
  }

  // ---------- Coach ----------

  function memberBadge(m) {
    const d = daysAgo(m.last_checkin);
    if (d == null) return `<span class="badge">${t('badge.none')}</span>`;
    if (d <= 7) return `<span class="badge good">${t('badge.active')}</span>`;
    if (d <= 14) return `<span class="badge warn">${t('badge.silent', { n: d })}</span>`;
    return `<span class="badge bad">${t('badge.silent', { n: d })}</span>`;
  }

  async function coachHome() {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    const { members } = await api('/coach/members');
    const render = (filter = '') => {
      const list = members.filter((m) =>
        (m.name + ' ' + m.email).toLowerCase().includes(filter.toLowerCase()));
      root.innerHTML = `
        <div class="page-head"><div><h1>${t('co.title')}</h1>
          <p class="sub">${t('co.sub', { n: members.length })}</p></div>
          <button class="btn" data-new>${t('co.new')}</button></div>
        <div class="card">
          <input class="input" data-search placeholder="${t('co.search')}" value="${esc(filter)}" style="margin-bottom:14px">
          ${list.length ? `<div class="table-wrap"><table class="table">
            <thead><tr><th>${t('th.member')}</th><th>${t('th.status')}</th><th>${t('th.lastcheckin')}</th>
            <th class="num">${t('th.weight')}</th><th class="num">${t('th.energy')}</th><th class="num">${t('tile.checkins')}</th></tr></thead>
            <tbody>${list.map((m) => `
              <tr class="clickable" data-open="${m.id}">
                <td><div class="person-row"><div class="avatar">${esc(initials(m.name))}</div>
                  <div class="who"><b>${esc(m.name)}</b><small>${esc(m.email)}</small></div></div></td>
                <td>${m.active ? memberBadge(m) : `<span class="badge bad">${t('badge.inactive')}</span>`}</td>
                <td>${m.last_checkin ? fmtDate(m.last_checkin) : '—'}</td>
                <td class="num">${m.last_weight != null ? fmtNum(m.last_weight) + ' kg' : '—'}</td>
                <td class="num">${m.last_energy != null ? m.last_energy + '/10' : '—'}</td>
                <td class="num">${m.checkin_count}</td>
              </tr>`).join('')}</tbody></table></div>`
          : `<div class="empty"><div class="big-emoji">🌱</div><p>${t('co.empty')}</p></div>`}
        </div>`;
      const search = root.querySelector('[data-search]');
      search.oninput = () => { const v = search.value; render(v);
        const s = root.querySelector('[data-search]'); s.focus(); s.setSelectionRange(v.length, v.length); };
      root.querySelectorAll('[data-open]').forEach((tr) => tr.onclick = () => {
        location.hash = '#/deelnemer/' + tr.dataset.open;
      });
      root.querySelector('[data-new]').onclick = () => newMemberModal();
    };
    render();
  }

  function newMemberModal(coaches = null, onDone = null) {
    const coachSelect = coaches ? `
      <div class="field"><label>${t('modal.coach')}</label>
        <select class="input" name="coach_id"><option value="">${t('modal.nocoach')}</option>
        ${coaches.filter((c) => c.active).map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>` : '';
    const m = modal(`
      <h3>${t('modal.newmember')}</h3>
      <form data-f style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label>${t('modal.name')}</label><input class="input" name="name" required placeholder="${t('modal.name.ph')}"></div>
        <div class="field"><label>${t('login.email')}</label><input class="input" name="email" type="email" required placeholder="${t('modal.email.ph')}"></div>
        ${coachSelect}
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-x>${t('btn.cancel')}</button>
          <button class="btn" type="submit">${t('btn.create')}</button>
        </div>
      </form>`);
    m.querySelector('[data-x]').onclick = closeModal;
    m.querySelector('[data-f]').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const body = { name: f.get('name'), email: f.get('email') };
        if (coaches) body.coach_id = f.get('coach_id') || null;
        const res = await api('/coach/members', { method: 'POST', body });
        tempPasswordModal(res, onDone || route);
      } catch (err) { toast(err.message, true); }
    };
  }

  async function memberDetailView(id) {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    let data;
    try { data = await api('/coach/members/' + id); }
    catch (err) {
      root.innerHTML = `<div class="card"><div class="empty"><p>${esc(err.message)}</p></div></div>`;
      return;
    }
    const { user, profile, checkins, notes } = data;
    const s = memberStats(profile, checkins);
    const backHref = state.user.role === 'admin' ? '#/deelnemers' : '#/';

    root.innerHTML = `
      <div class="page-head">
        <div>
          <a href="${backHref}" style="font-size:13.5px;font-weight:650">${t('co.back')}</a>
          <h1 style="margin-top:6px">${esc(user.name)}</h1>
          <p class="sub">${esc(user.email)} · ${t('co.since', { d: fmtDate(user.created_at) })}</p>
        </div>
        <button class="btn ghost" data-resetpw>${t('btn.resetpw')}</button>
      </div>
      <div class="tile-row">
        <div class="tile"><span class="tile-label">${t('tile.weight')}</span>
          <span class="tile-value">${fmtNum(s.current)}<small>kg</small></span>
          ${s.delta != null ? deltaHTML(s.delta, { goodWhenDown: s.goal == null || s.goal < s.start }) : ''}</div>
        <div class="tile"><span class="tile-label">${t('tile.goalweight')}</span>
          <span class="tile-value">${fmtNum(s.goal)}<small>kg</small></span></div>
        <div class="tile"><span class="tile-label">${t('tile.energy.short')}</span>
          <span class="tile-value">${s.energyAvg != null ? fmtNum(s.energyAvg, 1) + '<small>/10</small>' : '—'}</span></div>
        <div class="tile"><span class="tile-label">${t('tile.lastcheckin')}</span>
          <span class="tile-value" style="font-size:18px;padding-top:6px">${checkins.length ? fmtDate(checkins[checkins.length - 1].date) : '—'}</span></div>
      </div>
      ${chartCardsHTML()}
      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div><div class="card-title">${t('co.intake')}</div></div></div>
          ${profile && profile.completed ? intakeDetailHTML(profile) : `<div class="empty"><p>${t('co.intake.empty')}</p></div>`}
        </div>
        <div class="card">
          <div class="card-head"><div><div class="card-title">${t('co.notes')}</div>
            <div class="card-sub">${t('co.notes.sub')}</div></div></div>
          <form data-notef style="display:flex;gap:8px;margin-bottom:10px">
            <input class="input" name="text" placeholder="${t('co.notes.ph')}" required>
            <button class="btn" type="submit">+</button>
          </form>
          <div data-notes>${notesHTML(notes)}</div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('co.allcheckins')}</div></div></div>
        ${checkinTable(checkins)}
      </div>`;

    renderCharts(root, checkins, s.goal);

    root.querySelector('[data-notef]').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const res = await api(`/coach/members/${id}/notes`, { method: 'POST', body: { text: f.get('text') } });
        e.target.reset();
        root.querySelector('[data-notes]').innerHTML = notesHTML(res.notes);
      } catch (err) { toast(err.message, true); }
    };

    root.querySelector('[data-resetpw]').onclick = () => resetPasswordFlow(user, `/coach/members/${id}/reset-password`);
  }

  async function resetPasswordFlow(user, endpoint) {
    if (!await confirmModal(t('co.resetpw.title'), t('co.resetpw.text', { name: user.name }), t('co.resetpw.btn'))) return;
    try {
      const res = await api(endpoint, { method: 'POST' });
      const m = modal(`
        <h3>${t('co.resetpw.result')}</h3>
        ${passwordRevealHTML(res.password)}
        <div class="modal-actions"><button class="btn" data-done>${t('btn.done')}</button></div>`);
      m.querySelector('[data-copy]').onclick = () => copyText(res.password);
      m.querySelector('[data-done]').onclick = closeModal;
    } catch (err) { toast(err.message, true); }
  }

  function intakeDetailHTML(p) {
    const val = (v) => v == null || v === '' ? '—' : String(v);
    const num2 = (v, unit) => v == null ? '—' : `${fmtNum(v, 1)} ${unit}`;
    const drinksLabel = () => {
      const d = parseDrinks(p.drinks).map((c) => t('drink.' + c));
      return d.length ? d.join(', ') + (p.other_drink ? ` (${p.other_drink})` : '') : '—';
    };
    const address = [p.street && `${p.street} ${p.house_number || ''}`.trim(), p.zipcode, p.suburb, p.city, p.province, p.country]
      .filter(Boolean).join(', ');
    const sections = [
      [t('in.s.personal'), [
        [t('modal.name'), [p.first_name, p.surname].filter(Boolean).join(' ') || null],
        [t('in.facebook'), p.facebook_name],
        [t('in.phone'), p.phone],
        [t('in.whatsapp'), p.whatsapp],
        [t('in.gender'), p.gender ? t('gender.' + p.gender) : null],
        [t('pr.birthdate'), p.birthdate ? fmtDate(p.birthdate) : null],
        [t('in.s.address'), address || null],
      ]],
      [t('in.s.measure'), [
        [t('pr.height'), p.height_cm != null ? num2(p.height_cm, 'cm') : null],
        [t('in.weight'), p.start_weight != null ? num2(p.start_weight, 'kg') : null],
        [t('in.waist'), p.waist_cm != null ? num2(p.waist_cm, 'cm') : null],
        [t('in.energy'), p.energy_level != null ? p.energy_level + '/10' : null],
      ]],
      [t('in.s.goal'), [
        [t('in.goaltype'), p.goal_type ? t('goal.' + p.goal_type) : null],
        [t('in.goaldesc'), p.goal_text],
        [t('pr.goalweight'), p.goal_weight != null ? num2(p.goal_weight, 'kg') : null],
        [t('in.reason'), p.reason],
        [t('in.tried'), p.tried_before],
      ]],
      [t('in.s.habits'), [
        [t('in.meals'), p.meals_day],
        [t('in.snack'), p.snacking],
        [t('in.eatout'), p.eat_out],
        [t('in.water'), p.water_daily],
        [t('in.drinks'), parseDrinks(p.drinks).length ? drinksLabel() : null],
        [t('in.tired'), p.tired_when],
        [t('in.hungry'), p.hungry_when],
        [t('in.medication'), p.medication ?? p.health_notes],
      ]],
    ];
    return sections.map(([title, rows]) => {
      const filled = rows.filter(([, v]) => v != null && v !== '');
      if (!filled.length) return '';
      return `<div style="margin-bottom:6px">
        <div style="font-size:12.5px;font-weight:700;color:var(--ink-3);text-transform:uppercase;letter-spacing:.04em;margin:10px 0 2px">${esc(title)}</div>
        <div class="list">${filled.map(([k, v]) => `
          <div class="list-item" style="align-items:start"><small style="color:var(--ink-3);font-weight:650;max-width:45%">${esc(k)}</small>
            <span style="text-align:right;white-space:pre-wrap;max-width:55%">${esc(val(v))}</span></div>`).join('')}</div>
      </div>`;
    }).join('');
  }

  function notesHTML(notes) {
    if (!notes.length) return `<p style="color:var(--ink-3);font-size:13.5px">${t('co.notes.empty')}</p>`;
    return notes.map((n) => `
      <div class="note-item">
        <div style="white-space:pre-wrap">${esc(n.text)}</div>
        <div class="note-meta">${esc(n.coach_name)} · ${fmtDate(n.created_at)}</div>
      </div>`).join('');
  }

  // ---------- Admin ----------

  async function adminHome() {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    const [o, u] = await Promise.all([api('/admin/overview'), api('/admin/users')]);
    const silent = u.members.filter((m) => m.active && (daysAgo(m.last_checkin) == null || daysAgo(m.last_checkin) > 7));
    root.innerHTML = `
      <div class="page-head"><div><h1>${t('ad.title')}</h1>
        <p class="sub">${t('ad.sub')}</p></div></div>
      <div class="tile-row">
        <div class="tile"><span class="tile-label">${t('ad.tile.members')}</span><span class="tile-value">${o.members}</span></div>
        <div class="tile"><span class="tile-label">${t('ad.tile.coaches')}</span><span class="tile-value">${o.coaches}</span></div>
        <div class="tile"><span class="tile-label">${t('ad.tile.checkins')}</span><span class="tile-value">${o.checkins_week}</span></div>
        <div class="tile"><span class="tile-label">${t('ad.tile.active')}</span><span class="tile-value">${o.active_week}<small>${t('ad.of', { n: o.members })}</small></span></div>
      </div>
      ${o.unassigned ? `<div class="card" style="border-color:var(--warn-text)">
        <b>${t('ad.unassigned', { n: o.unassigned })}</b>
        <p style="color:var(--ink-2);font-size:14px;margin-top:4px">${t('ad.unassigned.link')} <a href="#/deelnemers">${t('nav.members')}</a>.</p>
      </div>` : ''}
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('ad.attention')}</div>
          <div class="card-sub">${t('ad.attention.sub')}</div></div></div>
        ${silent.length ? `<div class="list">${silent.slice(0, 8).map((m) => `
          <div class="list-item">
            <div class="person-row"><div class="avatar">${esc(initials(m.name))}</div>
              <div class="who"><b>${esc(m.name)}</b><small>${m.coach_name ? t('th.coach').toLowerCase() + ': ' + esc(m.coach_name) : t('badge.nocoach')}</small></div></div>
            <div style="display:flex;align-items:center;gap:10px">${memberBadge(m)}
              <a class="btn ghost small" href="#/deelnemer/${m.id}">${t('btn.view')}</a></div>
          </div>`).join('')}</div>`
        : `<div class="empty"><div class="big-emoji">🎉</div><p>${t('ad.attention.empty')}</p></div>`}
      </div>`;
  }

  async function adminMembersView() {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    const u = await api('/admin/users');
    const render = (filter = '') => {
      const list = u.members.filter((m) =>
        (m.name + ' ' + m.email + ' ' + (m.coach_name || '')).toLowerCase().includes(filter.toLowerCase()));
      root.innerHTML = `
        <div class="page-head"><div><h1>${t('ad.members.title')}</h1>
          <p class="sub">${t('ad.members.sub', { n: u.members.length })}</p></div>
          <button class="btn" data-new>${t('co.new')}</button></div>
        <div class="card">
          <input class="input" data-search placeholder="${t('ad.members.search')}" value="${esc(filter)}" style="margin-bottom:14px">
          ${list.length ? `<div class="table-wrap"><table class="table">
            <thead><tr><th>${t('th.member')}</th><th>${t('th.coach')}</th><th>${t('th.status')}</th><th>${t('th.lastcheckin')}</th><th></th></tr></thead>
            <tbody>${list.map((m) => `
              <tr>
                <td><div class="person-row"><div class="avatar">${esc(initials(m.name))}</div>
                  <div class="who"><b>${esc(m.name)}</b><small>${esc(m.email)}</small></div></div></td>
                <td>${m.coach_name ? esc(m.coach_name) : `<span class="badge warn">${t('badge.nocoach')}</span>`}</td>
                <td>${m.active ? memberBadge(m) : `<span class="badge bad">${t('badge.inactive')}</span>`}</td>
                <td>${m.last_checkin ? fmtDate(m.last_checkin) : '—'}</td>
                <td style="text-align:right">
                  <a class="btn ghost small" href="#/deelnemer/${m.id}">${t('btn.view')}</a>
                  <button class="btn ghost small" data-edit="${m.id}">${t('btn.edit')}</button>
                </td>
              </tr>`).join('')}</tbody></table></div>`
          : `<div class="empty"><p>${t('ad.members.empty')}</p></div>`}
        </div>`;
      const search = root.querySelector('[data-search]');
      search.oninput = () => { const v = search.value; render(v);
        const s = root.querySelector('[data-search]'); s.focus(); s.setSelectionRange(v.length, v.length); };
      root.querySelector('[data-new]').onclick = () => newMemberModal(u.coaches, adminMembersView);
      root.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => {
        const m = u.members.find((x) => x.id == b.dataset.edit);
        editUserModal(m, 'member', u.coaches, adminMembersView);
      });
    };
    render();
  }

  function newStaffModal(role, onDone) {
    const m = modal(`
      <h3>${role === 'admin' ? t('modal.newadmin') : t('modal.newcoach')}</h3>
      <form data-f style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label>${t('modal.name')}</label><input class="input" name="name" required placeholder="${t('modal.name.ph')}"></div>
        <div class="field"><label>${t('login.email')}</label><input class="input" name="email" type="email" required></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-x>${t('btn.cancel')}</button>
          <button class="btn" type="submit">${t('btn.create')}</button>
        </div>
      </form>`);
    m.querySelector('[data-x]').onclick = closeModal;
    m.querySelector('[data-f]').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      try {
        const res = await api('/admin/users', { method: 'POST', body: { role, name: f.get('name'), email: f.get('email') } });
        tempPasswordModal(res, onDone);
      } catch (err) { toast(err.message, true); }
    };
  }

  async function adminTeamView() {
    const root = shell(`<div class="skeleton">${t('loading')}</div>`);
    const u = await api('/admin/users');
    root.innerHTML = `
      <div class="page-head"><div><h1>${t('nav.team')}</h1>
        <p class="sub">${t('ad.team.sub')}</p></div></div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('ad.coaches.title')}</div></div>
          <button class="btn small" data-newcoach>${t('ad.coaches.new')}</button></div>
        ${u.coaches.length ? `<div class="table-wrap"><table class="table">
          <thead><tr><th>${t('th.coach')}</th><th class="num">${t('th.members')}</th><th>${t('th.status')}</th><th></th></tr></thead>
          <tbody>${u.coaches.map((c) => `
            <tr>
              <td><div class="person-row"><div class="avatar">${esc(initials(c.name))}</div>
                <div class="who"><b>${esc(c.name)}</b><small>${esc(c.email)}</small></div></div></td>
              <td class="num">${c.member_count}</td>
              <td>${c.active ? `<span class="badge good">${t('badge.active')}</span>` : `<span class="badge bad">${t('badge.inactive')}</span>`}</td>
              <td style="text-align:right">
                <button class="btn ghost small" data-edit-coach="${c.id}">${t('btn.edit')}</button>
                <button class="btn ghost small" data-pw="${c.id}">${t('btn.resetpw')}</button>
              </td>
            </tr>`).join('')}</tbody></table></div>`
        : `<div class="empty"><div class="big-emoji">🧑‍🏫</div><p>${t('ad.coaches.empty')}</p></div>`}
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('ad.admins.title')}</div>
          <div class="card-sub">${t('ad.admins.sub')}</div></div>
          <button class="btn small" data-newadmin>${t('ad.admins.new')}</button></div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>${t('th.admin')}</th><th>${t('th.status')}</th><th></th></tr></thead>
          <tbody>${u.admins.map((a) => `
            <tr>
              <td><div class="person-row"><div class="avatar">${esc(initials(a.name))}</div>
                <div class="who"><b>${esc(a.name)}${a.id === state.user.id ? ` <span class="badge">${t('you')}</span>` : ''}</b><small>${esc(a.email)}</small></div></div></td>
              <td>${a.active ? `<span class="badge good">${t('badge.active')}</span>` : `<span class="badge bad">${t('badge.inactive')}</span>`}</td>
              <td style="text-align:right">
                <button class="btn ghost small" data-edit-admin="${a.id}">${t('btn.edit')}</button>
                ${a.id !== state.user.id ? `<button class="btn ghost small" data-pw="${a.id}">${t('btn.resetpw')}</button>` : ''}
              </td>
            </tr>`).join('')}</tbody></table></div>
      </div>`;
    root.querySelector('[data-newcoach]').onclick = () => newStaffModal('coach', adminTeamView);
    root.querySelector('[data-newadmin]').onclick = () => newStaffModal('admin', adminTeamView);
    root.querySelectorAll('[data-edit-coach]').forEach((b) => b.onclick = () => {
      const c = u.coaches.find((x) => x.id == b.dataset.editCoach);
      editUserModal(c, 'coach', null, adminTeamView);
    });
    root.querySelectorAll('[data-edit-admin]').forEach((b) => b.onclick = () => {
      const a = u.admins.find((x) => x.id == b.dataset.editAdmin);
      editUserModal(a, 'admin', null, adminTeamView);
    });
    root.querySelectorAll('[data-pw]').forEach((b) => b.onclick = () => {
      const all = [...u.coaches, ...u.admins];
      const target = all.find((x) => x.id == b.dataset.pw);
      resetPasswordFlow(target, `/admin/users/${b.dataset.pw}/reset-password`);
    });
  }

  function editUserModal(user, role, coaches, onDone) {
    const coachSelect = role === 'member' && coaches ? `
      <div class="field"><label>${t('th.coach')}</label>
        <select class="input" name="coach_id"><option value="">${t('modal.nocoach')}</option>
        ${coaches.map((c) => `<option value="${c.id}"${user.coach_id === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>` : '';
    const m = modal(`
      <h3>${t('modal.edit.title', { name: esc(user.name) })}</h3>
      <form data-f style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label>${t('modal.name')}</label><input class="input" name="name" required value="${esc(user.name)}"></div>
        <div class="field"><label>${t('login.email')}</label><input class="input" name="email" type="email" required value="${esc(user.email)}"></div>
        ${coachSelect}
        <div class="field"><label>${t('modal.status')}</label>
          <select class="input" name="active">
            <option value="1"${user.active ? ' selected' : ''}>${t('modal.active')}</option>
            <option value="0"${!user.active ? ' selected' : ''}>${t('modal.inactive')}</option>
          </select></div>
        <div class="modal-actions">
          <button class="btn ghost" type="button" data-x>${t('btn.cancel')}</button>
          <button class="btn" type="submit">${t('btn.save')}</button>
        </div>
      </form>`);
    m.querySelector('[data-x]').onclick = closeModal;
    m.querySelector('[data-f]').onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      const body = { name: f.get('name'), email: f.get('email'), active: f.get('active') === '1' };
      if (role === 'member' && coaches) body.coach_id = f.get('coach_id') ? Number(f.get('coach_id')) : null;
      try {
        await api('/admin/users/' + user.id, { method: 'PUT', body });
        toast(t('toast.saved'));
        closeModal();
        onDone();
      } catch (err) { toast(err.message, true); }
    };
  }

  async function settingsView() {
    const root = shell('');
    root.innerHTML = `
      <div class="page-head"><div><h1>${t('set.title')}</h1></div></div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('pw.title')}</div></div></div>
        ${passwordFormHTML()}
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('set.lang')}</div></div></div>
        ${langToggleHTML()}
      </div>
      <div class="card">
        <div class="card-head"><div><div class="card-title">${t('set.display')}</div></div></div>
        <button class="btn ghost" data-th>${t('theme.switch')}</button>
      </div>`;
    bindPasswordForm(root);
    bindLangToggle(root);
    root.querySelector('[data-th]').onclick = cycleTheme;
  }

  // ============================================================
  // Router
  // ============================================================

  async function route() {
    closeModal();
    if (!state.user) { loginView(); return; }
    if (state.user.must_change_password) { forcePasswordView(); return; }

    const hash = location.hash || '#/';
    const detail = hash.match(/^#\/deelnemer\/(\d+)$/);
    const r = state.user.role;

    try {
      if (detail && (r === 'coach' || r === 'admin')) return await memberDetailView(detail[1]);
      if (r === 'member') {
        if (hash === '#/checkin') return await checkinView();
        if (hash === '#/historie') return await historyView();
        if (hash === '#/profiel') return await profileView();
        return await memberHome();
      }
      if (r === 'coach') {
        if (hash === '#/instellingen') return await settingsView();
        return await coachHome();
      }
      // admin
      if (hash === '#/deelnemers') return await adminMembersView();
      if (hash === '#/team' || hash === '#/coaches') return await adminTeamView();
      if (hash === '#/instellingen') return await settingsView();
      return await adminHome();
    } catch (err) {
      if (state.user) toast(err.message, true);
    }
  }

  async function boot() {
    try {
      const { user, profile } = await api('/me');
      state.user = user; state.profile = profile;
    } catch { state.user = null; }
    route();
  }

  window.addEventListener('hashchange', route);
  boot();
})();
