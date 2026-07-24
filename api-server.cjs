// Tag name to unique ID mapping for tags - PATCH26 Updated from Tags987.csv
const TAG_NAME_TO_ID = {
  // --- DEMOGRAPHICS ---
  // Ages (from CSV)
  "16 and under": "Yfxp8QQJtghr4qQPmkx8",
  "16": "PSPwCv5pAPk9kgHAXlbY",
  "17": "yYpBd3kiH0UhUJtM0Ymf",
  "18": "TYaWbgKh8ai492LRdp3n",
  "19": "5PSzhQ2e4SC6YgC9Tq19",
  "20": "VHmROHGeI7eM4D0xFT1H",
  "21": "3RFE8LOp5gmRFKBnq3Y7",
  "22": "Wk1k8kt8tZlALiVeW0Qq",
  "23": "SjDtv9VjoKmpzKZvfXzp",
  "24": "PIAq1kX4RW63lJ4jYZn0",
  "25": "ypAb8alCEnbvDlS5ZqLu",
  "Under 18": "cb70qB5JuW1SeTK7WmbY",
  "Over 18": "6Bj2Xtzi0uIWc8ZrTVtY",
  "Over 25": "sS3aP11L68igBoD7f0xe",

  // Socioeconomic (PATCH29: Corrected to actual CSV IDs)
  "All backgrounds": "20fXkU9RdlTlpfcS5K5D", // CSV: socioeconomic
  "Only those from lower socio-economic background": "V9J6aDjeQc7hIePqgsCh", // CSV: socioeconomic
  "Lower socio-economic background": "V9J6aDjeQc7hIePqgsCh", // Alias for above
  "Have or had free school meals": "KTZ2FRZNDwQImteZFmjG", // CSV: сommunities

  // Communities/Disability (PATCH29: ALL CSV IDs per concept - portal may check any category)
  "Physical disability": ["09Q2FEVzWlOBc5AqoypO", "QCMHvYz9oUPPPhOsXDek", "YI6XgFxHn8x4LYzkHkIM", "sehUuVOIEKmsYNpQROHe"],
    // 09Q2FE = communities, QCMHvY = сommunities, YI6XgF = equality #physicaldisability, sehUuV = equality #disability
  "Neurodiversity": ["4Ed3aFDBvrMHL53yYN4Z", "9RIS1UCc8jBeQY9lOpwf", "Yk6phdz0yBMP0c0rULDx"],
    // 4Ed3aF = сommunities, 9RIS1U = communities, Yk6phd = equality #neurodiversity
  "Hearing impairment": ["09Q2FEVzWlOBc5AqoypO", "QCMHvYz9oUPPPhOsXDek", "sehUuVOIEKmsYNpQROHe"],
    // No specific CSV entry - using Physical disability + disability equality IDs
  "Chronic illness": ["S6BVkq9Z9rSfeAs1rR78", "gmjSxiBG5v0rGUFwRdrZ", "sehUuVOIEKmsYNpQROHe"],
    // S6BVkq = communities, gmjSxi = сommunities, sehUuV = equality #disability
  "Visual impairment": ["09Q2FEVzWlOBc5AqoypO", "QCMHvYz9oUPPPhOsXDek", "sehUuVOIEKmsYNpQROHe"],
    // No specific CSV entry - using Physical disability + disability equality IDs
  "LGBTQIA+": ["92OxqHPOwpUDI765t62h", "RS64HjksdhniUorvNXLe", "mzZKi6mwaVEwTeNkpAjb"],
    // 92Oxq = сommunities, RS64Hj = pronoun, mzZKi6 = equality #LGBTQIA
  "Mental health": ["BqfXt7PgSC559RdiiT2w", "wxvBjYt6r8aXPo51j0nI", "sehUuVOIEKmsYNpQROHe"],
    // BqfXt7 = communities, wxvBjY = сommunities, sehUuV = equality #disability
  "Carer": ["EnzIhbSJi60VWwmFjq6F", "sehUuVOIEKmsYNpQROHe"],
    // EnzIhb = сommunities, sehUuV = equality #disability

  // Pronouns/Gender (from CSV)
  "ForThem": "2Dhp3LeTBZqgTedOOPMT",
  "He/Him": "BGHOxtT7mL635uaWX7Wd",
  "They/Them": "D8TZCPwER6lzJV3p1fmA",
  "She/Her": "Ljk28RD3LQJHXb1OXzz7",
  "Non-binary": "D8TZCPwER6lzJV3p1fmA", // Using They/Them ID
  "Transgender": "D8TZCPwER6lzJV3p1fmA", // Using They/Them ID
  "Intersex": "D8TZCPwER6lzJV3p1fmA", // Using They/Them ID
  "Other": "JNNkRh7GpLhmtNLhIBRZ", // Other ethnicity ID
  "Prefer not to say": "WMLPtNRCGSBbv7bViz1S", // Using Race ID

  // Experience (from CSV)
  "Someone looking to get work": "8oVouULyPluxVdnb1DJD",
  "Someone looking to explore": "Qjqkw3S9M7fyo4sE44kI",
  "Someone looking to upskill": "iqtWnDQCz1nldxBiLCXy",

  // --- ETHNICITY (Fixed from CSV) ---
  "Mixed": "7NFcbDXSsKW4OJJboIN8",
  "Mixed or Multiple Ethnic group": "dtHf8HC9oZbwuuykzRrE", // Fixed: correct CSV mapping
  "Other": "JNNkRh7GpLhmtNLhIBRZ",
  "Other Ethnic Group": "ZBpKSjEz0oGXA7Ju6Rh1", // Fixed: correct CSV mapping
  "White": "Tfsft2clh6NQfBzBwVRm",
  "White or White British": "OzWIBHiSh2UmWvQAQpFd", // Fixed: correct CSV mapping
  "Asian": "ZqmWly9vdEbaBk1fXker",
  "Asian or Asian British": "RRPIGD8goCRgLEiCoTsi", // Fixed: correct CSV mapping
  "Black": "igXCnhhokWdi5FvqiDha",
  "African, Caribbean or Black British": "DUK2DyQTTnvJXp83Cuuw", // Fixed: correct CSV mapping
  "Arab": "uoo9FHEqHrUFVGSc2McX", // Fixed: correct CSV mapping from ethnicity section
  "Prefer not to say": "WMLPtNRCGSBbv7bViz1S", // Using Race ID

  // --- INDUSTRIES (from CSV) ---
  "All creative industries": "IG7yzsOdsZcE1IttKMe8",
  "Advertising": "JcM1sqyxbJeyZsvXislN",
  "Marketing": "7zcvW4rUaiE9OCqGAf8f",
  "PR": "TwbKLH1maPxUpOMgo7av",
  "Arts": "NoUufyQpwT3qGsVQ7eKC",
  "Museum": "B00NlXT3BgZEcteyEBiQ",
  "Craft": "mVeikPlrGkeqUaNB3RUc",
  "Culture": "ieHxxs2T7J0RTWQyDqBJ",
  "Graphic design": "X2dTLDagIIrEBa40pwBL",
  "Design": "d25TFMPGin2nn2HUQ2ZS",
  "UX/UI design": "XDeiUF1tpazrs6j8nJnt",
  "Fashion": "BSAM73pkE5akPm0aAWEi",
  "Film": "TQP5sTYaSao3hzKyHoqX",
  "Directing": "Ar0PFRfo2BizErhHzOB1",
  "TV": "VluuJp7ikBDJvOZkCtMI",
  "Presenting": "eTJVhmAyjFVgLM1xobKQ",
  "Acting": "8EnwP2QmxphKt3xMydIv",
  "Gaming": "gEODfWliFcVDPzPsaURG",
  "Animation": "jtwd6Also1z1gnxf7cCR",
  "Content creation": "ajxlsmbwodNP5FfVPbvf",
  "Digital": "MyNQqi1cxSKxDzTFIUD1",
  "Music": "H9gLcUeM65AkTEjk8IzH",
  "Podcasting": "nHy5ygseyuQtNDUVxn0J",
  "Radio": "VxeP5CwyZNoKYK3hF8eC",
  "Audio": "Uq7j4jOln0DVzS5VQZIl",
  "Social Media": "2Bhal1Eyn4bfN719dFdM", // FIXED: Correct portal ID from working document 7AoSL3MXC7EuxSobSBKS
  "Videography": "GjC6ilPu74QiVYRvRvgg",
  "Publishing": "ybNc8iJxaoo7TjoJyl71",
  "Writing": "OWX5xMlENH8zEqL6ZJzI",
  "Theatre": "CG68CfUNdPkL8nJFzAih",
  "Performing arts": "zxLgYbKNdPL4QwJecnIw",
  "Comedy": "gvTLKWX76UhDquYF9UuL",
  "Dance": "CV02t8BX1lZ1teVZQpdM",
  "Journalism": "ggclbk2GjvOUbFZUH4ym",
  "VFX": "OKucTagUEJ5OSftS6DjH",
  "Architecture": "u6YjM78DnfHgJYoEn6td",
  "Travel": "VS2ca4vwGXaOZ6khfjff",
  "Visual arts": "etbVDUKJ63EHFcPlbn68",
  
  // --- CAREER (from CSV) ---
  "CVs & Portfolios": "Cfm3Qi6fKuYCnkrzNdqz",
  "Money & finance": "Fsupenr6EtZuhFXCUGAY",
  "Advice": "2OKsPtBRoqvFJQEkA9XU",
  "Mentoring": "XYrofvp4aWJUN8q0kqbA",
  "Networking": "Vy6sKZydj6wJIj9DTETW",
  "Portfolio advice": "EZ8pCPYQITDCvtAaLdGg",
  "Side hustle": "FuXsrn6y678PVhrqgTZE",
  "Freelancing": "JeWe9J7Wde0FENhxEcW1",
  "Apprenticeships": "LtF0yJ1Fa99hLPgcrAnm",
  "Industry knowledge": "V6tiLf4jn2zmuvkcxB0P",
  "Internships": "VqsCdV8yAjHIZs46vpgi",
  "Portfolio career": "evEppyXLsrW795Oma9Xj",
  "Online courses": "ZSC7cSm7tgtySwVirSXR",

  // --- EQUALITY & DIVERSITY (from CSV) ---
  "Accessibility": "9Z0KCkg1UndKEeGsGRWF",
  // "Physical disability" - REMOVED DUPLICATE! Already defined above with 3 IDs
  // "Neurodiversity" - REMOVED DUPLICATE! Already defined above with correct portal ID
  "Race": "WMLPtNRCGSBbv7bViz1S",
  "LGBTQIA": "mzZKi6mwaVEwTeNkpAjb",
  "Gender": "o4rMfwsP8UOAjvGwRhgP",
  "Disability": "sehUuVOIEKmsYNpQROHe",

  // --- WORK LIFE (from CSV) ---
  "Remote working": "buypYIgcB5e4FrJOKEA3",
  "Travel opportunities": "bs5frssJMw54bToCeDE4",
  "Maternity/paternity leave": "ojcmlhTMc5vT0mK4OBYn",
  "Flexible working": "rHFYF9GgaJpJrkMLO3RD",

  // --- TRAINING (from CSV) ---
  "Unconscious bias": "9Q2h3tBc2SY9R0Rrppfw",
  "Onboarding": "JkrVJTsFOxAaDeL6kusP",
  "Team building": "NweAZ9RUw5ECa0XvkKoF",
  "Soft skills": "RR2f9ImEpBsVoBniqDHb",
  "Technical skills": "gBPvSXXYUJ71l28c3GJ1",

  // --- PERKS (from CSV) ---
  "Unlimited holidays": "7P5Hf8CqYKW9Nh1RY5f8",
  "Branded merch": "IcM5f4EXFDZnfoeHn1HQ",
  "Work phone": "LtkTKVFdDOG3JGM7yAR9",
  "Discounts": "Vc9PVatz7TM4XbeMS2as",
  "Office parties": "nNAgMvJrxvFx9iCTIYpP",
  "Bonuses": "szqvbHXC1odr53r7dJAJ",
  "Dog friendly": "uI94cFJLSkuZvL06vsl6",
  "Healthcare": "xkAmPOEAk8244rXIXpdb",
  "Free breakfast": "bu1QkOIorG4fjYpxhc5e"
};
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { readFileSync } = require('fs');
const { join } = require('path');

console.log('Script start');

// Configuration
const config = {
  port: process.env.PORT || 8080,
  firebaseProjectUrl: process.env.FIREBASE_DATABASE_URL || 'https://neweric-744ee.firebaseio.com',
  serviceAccountPath: process.env.SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json',
  targetCollectionPath: process.env.MASTER_COLLECTION_PATH || 'announcements/announcements/list'
};


// Build service account object from environment variables
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID || 'neweric-744ee',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.firebaseProjectUrl,
  });
  console.log(`Firebase initialized with project: ${config.firebaseProjectUrl}`);
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1);
}

const db = admin.firestore();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: ['https://sirwoody123.github.io', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.text({ type: 'text/plain' })); // Support text input

/**
 * Parses text file format into JSON structure expected by transformData().
 * Handles key: value pairs and converts demographic text values into proper arrays.
 * @param {string} textContent The raw text content from the file.
 * @returns {Object} The parsed JSON structure.
 */
const parseTextFile = (textContent) => {
  console.log('🔍 TEXT PARSER: Starting text file parsing...');
  
  const rawLines = textContent.split('\n');
  const lines = rawLines.map(line => line.trim());
  const result = {
    title: '',
    description: '',
    link: '',
    applicationDeadline: '',
    location: '',
    regionLocation: '', // PATCH30: UK region
    remote: false,
    ukWide: false,
    opportunityType: 'Opportunity',
    salary: '',
    lengthOfApprenticeship: '',
    levelOfApprenticeship: '',
    lengthOfInternship: '',
    lengthOfCourse: '',
    paidOrFreeCourses: '',
    // Enhanced event-specific fields
    eventDate: '',
    eventTime: '',
    eventTimeEnd: '',
    eventName: '',
    anythingElseImportant: '',
     // Additional event details for comprehensive support
    eventDetails: {
      eventTitle: '',
      eventDescription: '',
      eventStartTime: '',
      eventEndTime: '',
      eventDuration: '',
      venueDetails: '',
      organizer: '',
      eventFormat: '',
      ticketPrice: '',
      bookingRegistration: '',
      capacity: '',
      targetAudience: '',
      eventType: '',
      refundPolicy: '',
      contactInformation: '',
      specialRequirements: ''
    },
    demographic: {
      industry: [],
      age: [],
      genderSexualPreference: [],
      ethnicity: [],
      disability: [],
      lowerSocioEconomicBackground: []
    }
  };

  // Iterate by index so we can gather multi-line values (lines until next key with ':')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes(':')) continue;

    const [rawKey, ...valueParts] = line.split(':');
    const key = rawKey.trim().replace(/^[-–—•*]+\s*/, ''); // Strip leading dashes/bullets
    let value = valueParts.join(':').trim();

    // Collect continuation lines (no colon) as part of the current value
    let j = i + 1;
    while (j < lines.length && !lines[j].includes(':')) {
      // Use rawLines to preserve original spacing/characters
      const cont = rawLines[j].trim();
      if (cont) value += '\n' + cont;
      j++;
    }
    // advance the outer loop to the last consumed line
    i = j - 1;

    console.log(`🔍 TEXT PARSER: Processing "${key.trim()}" = "${value}"`);
    
    switch (key.trim()) {
      case 'Application Deadline':
      case 'Application deadline':
        result.applicationDeadline = value;
        break;
        
      case 'Location':
        result.location = value;
        break;
        
      case 'Important Details':
        result.description = value;
        // Extract a meaningful title from the description
        if (!result.title && value) {
          // Look for company/role patterns in the text
          const companyMatch = value.match(/positions? at ([^®\.]+)/i);
          const roleMatch = value.match(/(Design|Developer|Engineer|Manager|Intern|Graduate|Apprentice)[^\.]*positions?/i);
          
          if (companyMatch) {
            const company = companyMatch[1].trim();
            const industry = result.demographic?.industry?.[0] || 'Role';
            result.title = `${industry} Opportunity at ${company}`;
          } else if (roleMatch) {
            result.title = roleMatch[0].trim();
          } else {
            // Fallback to first meaningful sentence
            const sentences = value.split('.');
            let titleSentence = sentences.find(s => 
              s.length > 20 && s.length < 100 && 
              !s.toLowerCase().includes('this opportunity')
            );
            
            if (titleSentence) {
              result.title = titleSentence.trim();
            } else {
              result.title = value.substring(0, 60) + '...';
            }
          }
        }
        break;
        
      case 'Remote':
        result.remote = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
        break;
        
      case 'UK Wide':
        result.ukWide = value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
        break;
        
      case 'Industry':
        // Split comma-separated values and clean them
        result.demographic.industry = value.split(',')
          .map(item => item.trim())
          .filter(item => item);
        console.log(`🔍 TEXT PARSER: Parsed industries:`, result.demographic.industry);
        break;
        
      case 'Age':
        // Handle "All ages" or specific age ranges
        if (value.toLowerCase() === 'all ages') {
          result.demographic.age = ['All ages'];
        } else {
          result.demographic.age = value.split(',')
            .map(item => item.trim())
            .filter(item => item);
        }
        console.log(`🔍 TEXT PARSER: Parsed ages:`, result.demographic.age);
        break;
        
      case 'Gender & Sexual Preference':
        if (value.toLowerCase() === 'all genders & preferences') {
          result.demographic.genderSexualPreference = ['All genders & preferences'];
        } else {
          result.demographic.genderSexualPreference = value.split(',')
            .map(item => item.trim())
            .filter(item => item);
        }
        console.log(`🔍 TEXT PARSER: Parsed gender & sexual preference:`, result.demographic.genderSexualPreference);
        break;
        
      case 'Ethnicity':
        if (value.toLowerCase() === 'all ethnicities') {
          result.demographic.ethnicity = ['All ethnicities'];
        } else {
          result.demographic.ethnicity = value.split(',')
            .map(item => item.trim())
            .filter(item => item);
        }
        console.log(`🔍 TEXT PARSER: Parsed ethnicities:`, result.demographic.ethnicity);
        break;
        
      case 'Opportunity Type':
        result.opportunityType = value;
        break;
        
      case 'Category':
        // PATCH30: Map Category field to opportunityType
        if (value && value.trim()) {
          result.opportunityType = value.trim();
          result.category = value.trim();
          console.log(`🔍 TEXT PARSER: Set opportunityType from Category: ${value}`);
        }
        break;
        
      case 'Disability':
        if (value.toLowerCase() === 'all disability') {
          result.demographic.disability = ['All disability'];
        } else {
          result.demographic.disability = value.split(',')
            .map(item => item.trim())
            .filter(item => item);
        }
        console.log(`🔍 TEXT PARSER: Parsed disability:`, result.demographic.disability);
        break;
        
      case 'Economic Background':
        if (value.toLowerCase() === 'all backgrounds') {
          result.demographic.lowerSocioEconomicBackground = ['All backgrounds'];
        } else {
          result.demographic.lowerSocioEconomicBackground = value.split(',')
            .map(item => item.trim())
            .filter(item => item);
        }
        console.log(`🔍 TEXT PARSER: Parsed economic background:`, result.demographic.lowerSocioEconomicBackground);
        break;
        
      case 'Region':
        // PATCH30: Always capture region for regionLocation field
        if (value && value.trim()) {
          result.regionLocation = value.trim();
          // Also use as location fallback if no specific location
          if (!result.location) {
            result.location = value;
          }
          console.log(`🔍 TEXT PARSER: Set regionLocation: ${value}`);
        }
        break;
        
      case 'Link':
        result.link = value;
        break;
        
      // === EVENT-SPECIFIC FIELDS ===
      case 'Event Title':
        result.eventDetails.eventTitle = value;
        // Use event title as main title if not already set
        if (!result.title) {
          result.title = value;
        }
        console.log(`🔍 TEXT PARSER: Set event title: ${value}`);
        break;
        
      case 'Event Description':
        result.eventDetails.eventDescription = value;
        // Also add to main description for compatibility
        if (!result.description) {
          result.description = value;
        }
        console.log(`🔍 TEXT PARSER: Set event description`);
        break;
        
      case 'Event Date':
        result.eventDate = value;
        // Store for potential use as deadline fallback
        console.log(`🔍 TEXT PARSER: Set event date: ${value}`);
        break;
        
      case 'Event Start Time':
        result.eventTime = value;
        result.eventDetails.eventStartTime = value;
        console.log(`🔍 TEXT PARSER: Set event start time: ${value}`);
        break;
        
      case 'Event End Time':
        result.eventTimeEnd = value;
        result.eventDetails.eventEndTime = value;
        console.log(`🔍 TEXT PARSER: Set event end time: ${value}`);
        break;
        
      case 'Event Duration':
        result.eventDetails.eventDuration = value;
        // Add to important details
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Duration: ${value}`;
        console.log(`🔍 TEXT PARSER: Set event duration: ${value}`);
        break;
        
      case 'Venue Details':
        result.eventDetails.venueDetails = value;
        // Add to important details for accessibility info
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Venue Details: ${value}`;
        console.log(`🔍 TEXT PARSER: Set venue details`);
        break;
        
      case 'Organizer':
        result.eventDetails.organizer = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Organized by: ${value}`;
        console.log(`🔍 TEXT PARSER: Set organizer: ${value}`);
        break;
        
      case 'Event Format':
        result.eventDetails.eventFormat = value;
        // Set remote based on format
        if (value.toLowerCase().includes('online')) {
          result.remote = true;
        }
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Format: ${value}`;
        console.log(`🔍 TEXT PARSER: Set event format: ${value}`);
        break;
        
      case 'Ticket Price':
        result.eventDetails.ticketPrice = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Price: ${value}`;
        console.log(`🔍 TEXT PARSER: Set ticket price: ${value}`);
        break;
        
      case 'Booking/Registration':
      case 'Booking':
      case 'Registration':
        result.eventDetails.bookingRegistration = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Booking: ${value}`;
        console.log(`🔍 TEXT PARSER: Set booking/registration info`);
        break;
        
      case 'Capacity':
        result.eventDetails.capacity = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Capacity: ${value}`;
        console.log(`🔍 TEXT PARSER: Set capacity: ${value}`);
        break;
        
      case 'Target Audience':
        result.eventDetails.targetAudience = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Target Audience: ${value}`;
        console.log(`🔍 TEXT PARSER: Set target audience: ${value}`);
        break;
        
      case 'Event Type':
        result.eventDetails.eventType = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Event Type: ${value}`;
        console.log(`🔍 TEXT PARSER: Set event type: ${value}`);
        break;
        
      case 'Refund Policy':
        result.eventDetails.refundPolicy = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Refund Policy: ${value}`;
        console.log(`🔍 TEXT PARSER: Set refund policy`);
        break;
        
      case 'Contact Information':
        result.eventDetails.contactInformation = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Contact: ${value}`;
        console.log(`🔍 TEXT PARSER: Set contact information`);
        break;
        
      case 'Special Requirements':
        result.eventDetails.specialRequirements = value;
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + `Requirements: ${value}`;
        console.log(`🔍 TEXT PARSER: Set special requirements`);
        break;
        
      case 'Anything else important':
      case 'Additional Information':
        // Append to existing important details
        result.anythingElseImportant += (result.anythingElseImportant ? '\n' : '') + value;
        console.log(`🔍 TEXT PARSER: Added additional important information`);
        break;
        
      // === APPRENTICESHIP & SALARY FIELDS ===
      case 'Salary': {
        // PATCH38: Strip leading category/type prefix from salary
        // LLM sometimes outputs "Salary: Freelance, negotiable" — strip the category word
        let salaryClean = value;
        const categoryPrefixes = ['competition/grant', 'junior full-time role', 'junior part-time role',
          'runner role', 'training scheme', 'work experience', 'freelance', 'apprenticeship',
          'internship', 'course', 'event', 'mentoring', 'competition', 'grant', 'opportunity'];
        const salaryLower = salaryClean.toLowerCase();
        for (const prefix of categoryPrefixes) {
          if (salaryLower.startsWith(prefix)) {
            salaryClean = salaryClean.substring(prefix.length).replace(/^[\s,:\-–—\/]+/, '').trim();
            console.log(`🔍 SALARY CLEAN: Stripped category prefix "${prefix}" from salary. Result: "${salaryClean}"`);
            break;
          }
        }
        // Capitalise first letter if the remaining value is a word like "negotiable"
        if (salaryClean && /^[a-z]/.test(salaryClean)) {
          salaryClean = salaryClean.charAt(0).toUpperCase() + salaryClean.slice(1);
        }
        result.salary = salaryClean;
        // Salary validation: warn if figures look suspiciously truncated
        const salaryNums = salaryClean.match(/[\d,]+\.?\d*/g);
        if (salaryNums) {
          for (const num of salaryNums) {
            const parsed = parseFloat(num.replace(/,/g, ''));
            if (parsed > 0 && parsed < 5000) {
              console.log(`⚠️ SALARY WARNING: Figure "${num}" looks suspiciously low — LLM may have truncated leading digits. Raw value: "${value}"`);
            }
          }
        }
        console.log(`🔍 TEXT PARSER: Set salary: ${salaryClean} (raw: ${value})`);
        break;
      }
        
      case 'Length of apprenticeship':
        result.lengthOfApprenticeship = value;
        result.opportunityType = 'Apprenticeship';
        console.log(`🔍 TEXT PARSER: Set lengthOfApprenticeship: ${value}, opportunityType to Apprenticeship`);
        break;
        
      case 'Level of apprenticeship':
        result.levelOfApprenticeship = value;
        result.opportunityType = 'Apprenticeship';
        console.log(`🔍 TEXT PARSER: Set levelOfApprenticeship: ${value}, opportunityType to Apprenticeship`);
        break;
        
      case 'Length of internship & start date/ month':
      case 'Length of internship':
        result.lengthOfInternship = value;
        result.opportunityType = 'Internship';
        console.log(`🔍 TEXT PARSER: Set lengthOfInternship: ${value}, opportunityType to Internship`);
        break;
        
      // === COURSE FIELDS ===
      case 'Length of course':
        result.lengthOfCourse = value;
        result.opportunityType = 'Course';
        console.log(`🔍 TEXT PARSER: Set lengthOfCourse: ${value}, opportunityType to Course`);
        break;
        
      case 'Course type':
        result.paidOrFreeCourses = value;
        result.opportunityType = 'Course';
        console.log(`🔍 TEXT PARSER: Set paidOrFreeCourses: ${value}, opportunityType to Course`);
        break;
        
      default:
        console.log(`🔍 TEXT PARSER: Unhandled field "${key.trim()}" = "${value}"`);
        break;
    }
  }

  // Enhanced title generation for events
  if (!result.title) {
    if (result.eventDetails.eventTitle) {
      result.title = result.eventDetails.eventTitle;
    } else if (result.eventDetails.eventType && result.demographic.industry.length > 0) {
      result.title = `${result.demographic.industry[0]} ${result.eventDetails.eventType}`;
    } else if (result.eventDetails.eventType) {
      result.title = result.eventDetails.eventType;
    } else {
      result.title = result.opportunityType === 'Event' ? 'Creative Event' : 'Opportunity';
    }
  }

  // Use event date as application deadline if no specific deadline provided
  if (!result.applicationDeadline && result.eventDate) {
    result.applicationDeadline = result.eventDate;
    console.log(`🔍 TEXT PARSER: Using event date as deadline: ${result.applicationDeadline}`);
  }

  // PATCH30: Prioritize region over remote status
  if (result.regionLocation && result.regionLocation.trim() !== '') {
    if (result.remote === true) {
      console.log(`🔍 TEXT PARSER: Region "${result.regionLocation}" specified with Remote=Yes — overriding remote to false`);
      result.remote = false;
    }
  }

  // PATCH30: Add warning for Instagram/LinkedIn sourced opportunities
  if (result.link) {
    const linkLower = result.link.toLowerCase();
    let sourceWarning = '';
    if (linkLower.includes('instagram.com') || linkLower.includes('instagr.am')) {
      sourceWarning = '⚠️ SOURCE WARNING: This opportunity was scraped from Instagram. Details may be incorrect or incomplete — please check before approving.';
    } else if (linkLower.includes('linkedin.com') || linkLower.includes('lnkd.in')) {
      sourceWarning = '⚠️ SOURCE WARNING: This opportunity was scraped from LinkedIn. Details may be incorrect or incomplete — please check before approving.';
    }
    if (sourceWarning) {
      result.anythingElseImportant = result.anythingElseImportant
        ? sourceWarning + '\n\n' + result.anythingElseImportant
        : sourceWarning;
      console.log(`🔍 TEXT PARSER: Added source warning for ${linkLower}`);
    }
  }

  // PATCH30: Content heuristics — detect explicit demographic targeting in content
  const contentForDemographicDetection = ((result.anythingElseImportant || '') + ' ' + (result.title || '') + ' ' + (result.description || '')).toLowerCase();

  // Age heuristic
  const detectedAges = [];
  if (/\b(young people|young person|youth|under.?18|aged?\s*1[3-7]|13.?1[7]|teen(ager)?s?)\b/.test(contentForDemographicDetection)) detectedAges.push('Under 18');
  if (/\b(18.?25|aged?\s*(18|19|20|21|22|23|24|25)|under.?25|young adults?|early career|recent graduate|graduate)\b/.test(contentForDemographicDetection)) {
    detectedAges.push('18','19','20','21','22','23','24','25');
  }
  if (/\b(over.?25|25\+|all ages? (and|&) experience|mid.?career|senior)\b/.test(contentForDemographicDetection)) detectedAges.push('Over 25');
  if (/\b(16.?(and|\+|plus)? ?(under|below)|under.?16|aged?\s*(1[0-6])|primary school|secondary school)\b/.test(contentForDemographicDetection)) detectedAges.push('16 and under');
  if (detectedAges.length > 0) {
    result.demographic.age = [...new Set(detectedAges)];
    console.log('🔍 TEXT PARSER: Detected specific age targeting — narrowing to:', result.demographic.age.join(', '));
  }

  // Gender heuristic
  if (/\b(creative women|women in business|for women|women only|female (founders?|creatives?|artists?|writers?|graduates?|students?|professionals?|entrepreneurs?)|women'?s network)\b/.test(contentForDemographicDetection)) {
    result.demographic.genderSexualPreference = ['She/Her', 'They/Them'];
    console.log('🔍 TEXT PARSER: Detected explicit women-targeted opportunity — setting gender to She/Her, They/Them');
  } else if (/\b(for men|men only|male (founders?|creatives?|artists?|writers?|graduates?|students?|professionals?|entrepreneurs?)|men'?s network)\b/.test(contentForDemographicDetection)) {
    result.demographic.genderSexualPreference = ['He/Him', 'They/Them'];
    console.log('🔍 TEXT PARSER: Detected explicit men-targeted opportunity — setting gender to He/Him, They/Them');
  } else if (/\b(lgbtq\w*|queer|trans(gender)?|non.?binary|pride|gay|lesbian|bisexual)\b/.test(contentForDemographicDetection)) {
    result.demographic.genderSexualPreference = ['LGBTQIA+', 'They/Them', 'Non-binary', 'Transgender'];
    console.log('🔍 TEXT PARSER: Detected LGBTQIA+-targeted opportunity — setting gender to LGBTQIA+, They/Them, Non-binary, Transgender');
  }

  // Ethnicity heuristic
  const detectedEthnicities = [];
  if (/\b(black (writers?|authors?|artists?|creatives?|poets?|filmmakers?|musicians?|designers?|graduates?|students?|professionals?|entrepreneurs?|founders?|people|communities|voices|heritage|backgrounds?|young people)|for black\b|afro.?caribbean|black british)\b/.test(contentForDemographicDetection)) {
    detectedEthnicities.push('African, Caribbean or Black British');
  }
  if (/\b(south asian|british asian|asian (writers?|artists?|creatives?|graduates?|students?|professionals?|entrepreneurs?|founders?|people|communities|voices)|for asian\b|bangladeshi|pakistani|indian|sri lankan)\b/.test(contentForDemographicDetection)) {
    detectedEthnicities.push('Asian or Asian British');
  }
  if (/\b(arab (writers?|artists?|creatives?|graduates?|students?|professionals?|communities|voices)|for arab\b|middle eastern|mena)\b/.test(contentForDemographicDetection)) {
    detectedEthnicities.push('Arab');
  }
  if (/\b(mixed heritage|mixed race|dual heritage|multi.?racial|mixed ethnic)\b/.test(contentForDemographicDetection)) {
    detectedEthnicities.push('Mixed or Multiple Ethnic group');
  }
  if (/\b(global majority|people of colour|person of colour|poc\b|bame\b|ethnic minorit\w*|underrepresented ethnic\w*)\b/.test(contentForDemographicDetection)) {
    detectedEthnicities.push('African, Caribbean or Black British');
    detectedEthnicities.push('Asian or Asian British');
    detectedEthnicities.push('Mixed or Multiple Ethnic group');
    detectedEthnicities.push('Other Ethnic Group');
    detectedEthnicities.push('Arab');
  }
  if (detectedEthnicities.length > 0) {
    result.demographic.ethnicity = [...new Set(detectedEthnicities)];
    console.log('🔍 TEXT PARSER: Detected specific ethnicity targeting — narrowing to:', result.demographic.ethnicity.join(', '));
  }

  // Disability heuristic
  const neurodiversityTerms = /\b(neurodivers\w*|autis\w*|dyslexi\w*|dyspraxi\w*|adhd|add|asperger'?s?|dyscalculi\w*|dysgraphi\w*|tourette'?s?|sensory processing)\b/;
  const physicalDisabilityTerms = /\b(physical(ly)? disab\w*|wheelchair|mobility|blind|deaf|hearing impair\w*|visual(ly)? impair\w*|amputee|paralys\w*|parapleig\w*|cerebal palsy|limb (difference|loss))\b/;
  const mentalHealthTerms = /\b(mental health|anxiety|depression|ptsd|bipolar|schizophren\w*|eating disorder|ocd|obsessive.compulsive|psychosis|mental illness)\b/;
  const chronicIllnessTerms = /\b(chronic (illness|pain|condition|fatigue)|fibromyalgi\w*|crohn'?s?|lupus|epilep\w*|diabet\w*|multiple sclerosis|m\.?e\.?|cfs|long.?covid|endometriosis|arthritis)\b/;
  const carerTerms = /\b(carer|caregiver|caring responsibilit\w*|young carer)\b/;
  const detectedDisabilities = [];
  if (neurodiversityTerms.test(contentForDemographicDetection)) detectedDisabilities.push('Neurodiversity');
  if (physicalDisabilityTerms.test(contentForDemographicDetection)) detectedDisabilities.push('Physical disability');
  if (mentalHealthTerms.test(contentForDemographicDetection)) detectedDisabilities.push('Mental health');
  if (chronicIllnessTerms.test(contentForDemographicDetection)) detectedDisabilities.push('Chronic illness');
  if (carerTerms.test(contentForDemographicDetection)) detectedDisabilities.push('Carer');
  if (detectedDisabilities.length > 0) {
    result.demographic.disability = detectedDisabilities;
    console.log('🔍 TEXT PARSER: Detected specific disability targeting — narrowing to:', detectedDisabilities.join(', '));
  }

  // Socioeconomic heuristic
  const detectedSocioEconomic = [];
  if (/\b(low.?income|lower socio.?economic|disadvantaged|deprived|working class|social mobility|socio.?economic(ally)? disadvantaged|under.?privileged|poverty)\b/.test(contentForDemographicDetection)) {
    detectedSocioEconomic.push('Only those from lower socio-economic background');
  }
  if (/\b(free school meals?|fsm|pupil premium|ema|educational maintenance)\b/.test(contentForDemographicDetection)) {
    detectedSocioEconomic.push('Have or had free school meals');
  }
  if (detectedSocioEconomic.length > 0) {
    result.demographic.lowerSocioEconomicBackground = detectedSocioEconomic;
    console.log('🔍 TEXT PARSER: Detected specific socioeconomic targeting — narrowing to:', detectedSocioEconomic.join(', '));
  }

  console.log('🔍 TEXT PARSER: Final parsed result:', JSON.stringify(result, null, 2));
  return result;
};

/**
 * Transforms data from the standalone parser format to the master portal format.
 * @param {Object} data The data from the standalone parser.
 * @returns {Object} The transformed data for the master portal.
 */
const transformData = (data) => {
  // Always use this companyID and created value
  const fixedCompanyID = 'S7IvlojyomcTNsUXlrqC';
  
  // --- TAGS LOGIC ---
  function normalizeKey(s) {
    return String(s || '')
      .trim()
      .toLowerCase()
      .replace(/[\s\u00A0]+/g, ' ')
      .replace(/["'`]/g, '')
      .replace(/[&]/g, 'and');
  }

  function looksLikeId(s) {
    if (!s) return false;
    const t = String(s).trim();
    // Firestore IDs are typically 20+ chars alphanumeric with -_ sometimes
    return /^[A-Za-z0-9_-]{15,}$/.test(t);
  }

  function getTagCode(tag) {
    if (!tag && tag !== 0) return null;
    const raw = String(tag).trim();

    // If input already looks like an ID, return it as-is
    if (looksLikeId(raw)) return raw;

    // Strip leading '#' and normalize
    const stripped = raw.startsWith('#') ? raw.substring(1) : raw;
    const key = normalizeKey(stripped);

    // Try exact and normalized matches (PATCH28C: Handle array values)
    if (TAG_NAME_TO_ID.hasOwnProperty(stripped)) {
      const result = TAG_NAME_TO_ID[stripped];
      return Array.isArray(result) ? result : result; // Return as-is (could be string or array)
    }
    for (const k of Object.keys(TAG_NAME_TO_ID)) {
      if (normalizeKey(k) === key) {
        const result = TAG_NAME_TO_ID[k];
        return Array.isArray(result) ? result : result; // Return as-is (could be string or array)
      }
    }
    return null;
  }
  
  let allTags = new Set();

  // Helper to add a tag if it resolves to a valid ID (PATCH25: Enhanced debugging + Handle multiple IDs)
  function addTag(tag) {
    if (typeof tag === 'string') {
      console.log(`🔍 PATCH25 DEBUG: Processing tag "${tag}"`);
      const tagResult = getTagCode(tag);
      console.log(`🔍 PATCH25 DEBUG: getTagCode("${tag}") returned:`, tagResult);
      
      if (tagResult) {
        if (Array.isArray(tagResult)) {
          // Add all IDs if it's an array (e.g., Physical disability has 3 IDs)
          console.log(`✅ PATCH25 DEBUG: Adding ${tagResult.length} IDs for "${tag}":`, tagResult);
          tagResult.forEach(id => allTags.add(id));
        } else {
          // Add single ID
          console.log(`✅ PATCH25 DEBUG: Adding single ID for "${tag}":`, tagResult);
          allTags.add(tagResult);
        }
      } else {
        console.log(`❌ PATCH25 DEBUG: No tag ID found for "${tag}"`);
      }
    } else {
      console.log(`⚠️ PATCH25 DEBUG: Skipping non-string tag:`, tag);
    }
  }

  // Process industry tags
  if (data.demographic && Array.isArray(data.demographic.industry)) {
    data.demographic.industry.forEach(addTag);
  }

  // Process demographic fields (PATCH26: Fixed demographic processing)
  const demo = data.demographic || {};
  console.log('🔍 PATCH26 DEBUG: Processing demographic data:', JSON.stringify(demo, null, 2));
  
  const demographicFields = ['age', 'genderSexualPreference', 'ethnicity', 'disability', 'lowerSocioEconomicBackground'];
  demographicFields.forEach(field => {
    if (demo[field]) {
      console.log(`🔍 PATCH26 DEBUG: Processing ${field}:`, demo[field]);
      if (Array.isArray(demo[field])) {
        // Handle array of demographic values
        demo[field].forEach(value => {
          console.log(`🔍 PATCH26 DEBUG: Processing demographic value "${value}" from ${field}`);
          addTag(value);
        });
      } else {
        // Handle single demographic value
        console.log(`🔍 PATCH26 DEBUG: Processing single demographic value "${demo[field]}" from ${field}`);
        addTag(demo[field]);
      }
    }
  });

  // Process any additional tags (PATCH25: Enhanced debugging)
  console.log('🔍 PATCH25 DEBUG: Processing tags. data.tags structure:', JSON.stringify(data.tags, null, 2));
  
  if (Array.isArray(data.tags)) {
    console.log('🔍 PATCH25 DEBUG: Processing data.tags as array:', data.tags);
    data.tags.forEach(addTag);
  } else if (data.tags && typeof data.tags === 'object' && Array.isArray(data.tags.tags)) {
    console.log('🔍 PATCH25 DEBUG: Processing data.tags.tags as array:', data.tags.tags);
    data.tags.tags.forEach(addTag);
  } else {
    console.log('❌ PATCH25 DEBUG: No valid tags array found');
  }

  // Convert Set to Array
  const tags = Array.from(allTags);

  // Get the source demographic data
  const sourceDemographic = data.tags?.demographic || {};
  
  // PATCH27 FIX: Portal needs BOTH tags array AND demographic object
  // Tags array: for hashtag section
  // Demographic object: for demographic sections (Age, Gender, Ethnicity, Disability, Socio-Economic)
  
  // Build demographic object with text values for portal UI
  function buildDemographicObject(demographicData) {
    console.log('🔍 PATCH26 DEBUG: Building demographic object from:', JSON.stringify(demographicData, null, 2));
    
    const result = {
      industry: [],
      age: [],
      genderSexualPreference: [],
      ethnicity: [],
      disability: [],
      lowerSocioEconomicBackground: []
    };
    
    if (demographicData && typeof demographicData === 'object') {
      // Map arrays to text values for portal display
      if (Array.isArray(demographicData.age)) {
        result.age = demographicData.age;
      }
      if (Array.isArray(demographicData.genderSexualPreference)) {
        result.genderSexualPreference = demographicData.genderSexualPreference;
      }
      if (Array.isArray(demographicData.ethnicity)) {
        result.ethnicity = demographicData.ethnicity;
      }
      if (Array.isArray(demographicData.disability)) {
        result.disability = demographicData.disability;
      }
      if (Array.isArray(demographicData.lowerSocioEconomicBackground)) {
        result.lowerSocioEconomicBackground = demographicData.lowerSocioEconomicBackground;
      }
      if (Array.isArray(demographicData.industry)) {
        result.industry = demographicData.industry;
      }
    }
    
    console.log('🔍 PATCH26 DEBUG: Built demographic object result:', JSON.stringify(result, null, 2));
    return result;
  }

  // PATCH31: Normalize dates from queue/review app to portal-safe ISO datetime.
  function normalizePortalDate(raw) {
    if (!raw) return '';
    const value = String(raw).trim();
    if (!value) return '';

    // Already an ISO datetime
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return value;

    // yyyy-mm-dd date-only
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00:00.000Z`;

    // dd/mm/yyyy from sheet fields
    const dmy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      const dd = String(Number(dmy[1])).padStart(2, '0');
      const mm = String(Number(dmy[2])).padStart(2, '0');
      const yyyy = dmy[3];
      return `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T00:00:00.000Z`;
  }

  let sanitizedDeadline = normalizePortalDate(data.applicationDeadline || '');
  if (!sanitizedDeadline && data.applicationDeadline) {
    console.log(`⚠️ TRANSFORM: applicationDeadline "${data.applicationDeadline}" could not be normalized — clearing to empty`);
  }

  // PATCH30: Map category label ↔ name so both fields are always correct
  const allowedCategories = [
    { label: 'Apprenticeship', name: 'apprenticeship' },
    { label: 'Competition/Grant', name: 'competition/grant' },
    { label: 'Course', name: 'course' },
    { label: 'Event', name: 'event' },
    { label: 'Freelance role', name: 'freelance-role' },
    { label: 'Internship', name: 'internship' },
    { label: 'Junior full-time role', name: 'junior-full-time-role' },
    { label: 'Junior part-time role', name: 'junior-part-time-role' },
    { label: 'Mentoring', name: 'mentoring' },
    { label: 'Opportunity', name: 'opportunity' },
    { label: 'Runner role', name: 'runner-role' },
    { label: 'Training scheme', name: 'training-scheme' },
    { label: 'Work experience', name: 'work-experience' }
  ];
  const rawCat = (data.category || data.opportunityType || '').trim();
  let resolvedCatName = '';
  let resolvedCatLabel = '';
  if (rawCat) {
    // Canonicalize helper: lower, replace non-alphanumeric with space, collapse spaces
    function canonicalize(s) {
      return String(s || '')
        .toLowerCase()
        .replace(/[\u2010-\u2015\-_/\\]+/g, ' ') // treat various dashes/slashes as spaces
        .replace(/[^a-z0-9\s]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    const rawCanon = canonicalize(rawCat);
    // Try exact name match first
    let catMatch = allowedCategories.find(c => canonicalize(c.name) === rawCanon);
    if (!catMatch) catMatch = allowedCategories.find(c => canonicalize(c.label) === rawCanon);
    if (!catMatch) {
      // Try direct lower-case match as a fallback (keeps previous behaviour)
      catMatch = allowedCategories.find(c => c.name.toLowerCase() === rawCat.toLowerCase()) ||
                 allowedCategories.find(c => c.label.toLowerCase() === rawCat.toLowerCase());
    }
    if (catMatch) {
      resolvedCatName = catMatch.name;
      resolvedCatLabel = catMatch.label;
    } else {
      // Fallback: generate a normalized slug using hyphen (preserve previous fallback behaviour)
      resolvedCatName = rawCat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      resolvedCatLabel = rawCat;
    }
  }

  return {
    // Required fields from actual portal format
    anythingElseImportant: data.anythingElseImportant ?? '',
    applicationDeadline: sanitizedDeadline,
    author: data.author || '',
    bannerPic: data.bannerPic || '',
    category: resolvedCatName,
    categoryTitle: resolvedCatLabel,
    opportunityType: resolvedCatName,
    companyID: fixedCompanyID,
    companyVerify: data.companyVerify ?? true,
    courseLocation: data.courseLocation || '',
    created: fixedCompanyID,
    createdAt: data.createdAt || '',
    description: data.description || '',
    editedAt: data.editedAt || '',
    editor: data.editor || 'scheduler',
    id: data.id || '',
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    lengthOfCourse: data.lengthOfCourse || '',
    lengthOfApprenticeship: data.lengthOfApprenticeship || '',
    lengthOfInternship: data.lengthOfInternship || '',
    levelOfApprenticeship: data.levelOfApprenticeship || '',
    salary: data.salary || '',
    link: data.link || '',
    paidOrFreeCourses: data.paidOrFreeCourses || '',
    publishedAt: data.publishedAt || '',
    schedulePost: data.schedulePost || '',
  status: data.status || 'scouted',
    tags: tags,
    title: data.title || '',
    type: data.type || 'announcements',
    userClaps: Array.isArray(data.userClaps) ? data.userClaps : [],
    userContentView: Array.isArray(data.userContentView) ? data.userContentView : [],
    // Optional/extra fields for compatibility
    approvalFirst: data.approvalFirst ?? false,
    bespokeOnly: data.bespokeOnly ?? false,
    eventDate: data.eventDate || '',
    eventName: data.eventName || '',
    eventTime: data.eventTime || '',
    eventTimeEnd: data.eventTimeEnd || '',
    expiredDate: data.expiredDate || '',
    location: data.location || '',
    locationName: data.locationName || '',
    notificated: data.notificated ?? false,
    regionLocation: data.regionLocation ?? null,
    remote: data.remote ?? false,
    republish: data.republish ?? false,
    supportSettings: Array.isArray(data.supportSettings) ? data.supportSettings : [],
    ukWide: data.ukWide ?? false,
    userLinkClick: Array.isArray(data.userLinkClick) ? data.userLinkClick : [],
    usersFavouriteContent: Array.isArray(data.usersFavouriteContent) ? data.usersFavouriteContent : [],
    
    // PATCH27 FIX: Add demographic object for portal UI demographic sections
    demographic: buildDemographicObject(data.demographic),
    
    // PATCH28: Add enhanced title generation fields
    jobTitle: data.jobTitle || '',
    employer: data.employer || '',
    
    // PATCH29: Enhanced event fields support
    ...(data.eventDetails ? {
      eventDetails: {
        eventTitle: data.eventDetails.eventTitle || '',
        eventDescription: data.eventDetails.eventDescription || '',
        eventStartTime: data.eventDetails.eventStartTime || '',
        eventEndTime: data.eventDetails.eventEndTime || '',
        eventDuration: data.eventDetails.eventDuration || '',
        venueDetails: data.eventDetails.venueDetails || '',
        organizer: data.eventDetails.organizer || '',
        eventFormat: data.eventDetails.eventFormat || '',
        ticketPrice: data.eventDetails.ticketPrice || '',
        bookingRegistration: data.eventDetails.bookingRegistration || '',
        capacity: data.eventDetails.capacity || '',
        targetAudience: data.eventDetails.targetAudience || '',
        eventType: data.eventDetails.eventType || '',
        refundPolicy: data.eventDetails.refundPolicy || '',
        contactInformation: data.eventDetails.contactInformation || '',
        specialRequirements: data.eventDetails.specialRequirements || ''
      }
    } : {}),
    
    // GEOLOCATION FEATURE: Add _geoloc field for location-based filtering
    ...(data._geoloc && typeof data._geoloc === 'object' && 
        typeof data._geoloc.lat === 'number' && 
        typeof data._geoloc.lng === 'number' ? {
      _geoloc: {
        lat: data._geoloc.lat,
        lng: data._geoloc.lng
      }
    } : {})
  };
};

/**
 * Endpoint to receive opportunity data from the standalone parser.
 * Supports both JSON and text file formats.
 */
app.post('/opportunities', async (req, res) => {
  try {
    let opportunityData;
    
    // Detect input format and parse accordingly
    const contentType = req.get('content-type') || '';
    console.log('🔍 INPUT DETECTION: Content-Type:', contentType);
    console.log('🔍 INPUT DETECTION: Body type:', typeof req.body);
    
    if (contentType.includes('text/plain') || typeof req.body === 'string') {
      // Handle text file input
      console.log('🔍 INPUT DETECTION: Processing as text file');
      const textContent = req.body;
      console.log('🔍 INPUT DETECTION: Text content length:', textContent.length);
      opportunityData = parseTextFile(textContent);
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Handle JSON input (existing behavior)
      console.log('🔍 INPUT DETECTION: Processing as JSON');
      opportunityData = req.body;
    } else {
      // Try to auto-detect format based on content
      const bodyStr = String(req.body);
      if (bodyStr.includes(':') && bodyStr.includes('\n')) {
        console.log('🔍 INPUT DETECTION: Auto-detected as text format');
        opportunityData = parseTextFile(bodyStr);
      } else {
        console.log('🔍 INPUT DETECTION: Processing as JSON (fallback)');
        opportunityData = req.body;
      }
    }
    
    console.log('Processed opportunity data:', {
      id: opportunityData.id,
      type: opportunityData.opportunityType,
      title: opportunityData.title,
      hasDescription: !!opportunityData.description,
      hasLink: !!opportunityData.link,
      hasDemographics: !!opportunityData.demographic
    });

    // 1. Transform the data
    const transformedData = transformData(opportunityData);

    // 2. Save to master portal's Firebase using configured collection path
    const [collection, subcollection, listCollection] = config.targetCollectionPath.split('/');
    
    console.log(`🔥 PATCH28: Attempting Firebase write to ${collection}/${subcollection}/${listCollection}`);
    console.log('🔥 PATCH28: Firebase credentials check:', {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.FIREBASE_PROJECT_ID?.substring(0, 10) + '...'
    });
    
    // Always use Firebase auto-generated ID
    console.log('🔥 PATCH28: Calling db.collection().add()...');
    const docRef = await db.collection(collection).doc(subcollection).collection(listCollection).add(transformedData);
    console.log('🔥 PATCH28: Firebase add() successful, doc ID:', docRef.id);
    
    // Update the ID in the document with Firebase's auto-generated ID
    const generatedId = docRef.id;
    transformedData.id = generatedId;
    console.log('🔥 PATCH28: Calling docRef.update()...');
    await docRef.update({ id: generatedId });
    console.log('🔥 PATCH28: Firebase update() successful');

    console.log(`✅ Successfully saved to master portal: ${config.targetCollectionPath}/${generatedId}`);
    console.log('Transformed data:', transformedData);

    res.status(200).json({
      message: 'Data received and processed successfully.',
      masterPortalDocId: generatedId,
      collectionPath: config.targetCollectionPath,
      data: transformedData,
    });
  } catch (error) {
    console.error('❌ PATCH28: Error processing opportunity:', error);
    console.error('❌ PATCH28: Error stack:', error.stack);
    console.error('❌ PATCH28: Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      details: error.details
    });
    res.status(500).json({
      error: 'Error processing request.',
      details: error.message,
      patch28Debug: {
        errorCode: error.code,
        errorName: error.name,
        stackTrace: error.stack?.split('\n').slice(0, 3)
      }
    });
  }
});

// PATCH28: Document verification endpoint
app.get('/opportunities/:docId', async (req, res) => {
  try {
    const docId = req.params.docId;
    const [collection, subcollection, listCollection] = config.targetCollectionPath.split('/');
    
    console.log(`🔍 PATCH28: Attempting to read document ${docId} from ${collection}/${subcollection}/${listCollection}`);
    
    const docRef = db.collection(collection).doc(subcollection).collection(listCollection).doc(docId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      console.log(`✅ PATCH28: Document ${docId} exists!`);
      res.status(200).json({
        exists: true,
        id: docId,
        data: docSnap.data()
      });
    } else {
      console.log(`❌ PATCH28: Document ${docId} does not exist`);
      res.status(404).json({
        exists: false,
        id: docId,
        message: 'Document not found'
      });
    }
  } catch (error) {
    console.error(`❌ PATCH28: Error reading document ${req.params.docId}:`, error);
    res.status(500).json({
      error: 'Error reading document',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: {
      port: config.port,
      firebaseProject: config.firebaseProjectUrl
    }
  });
});

console.log('Starting server...');

// ─── Review App Endpoints ────────────────────────────────────────────────────

app.get('/debug-creds', (req, res) => {
  res.json({
    hasBase64: !!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKeyStart: (process.env.GOOGLE_PRIVATE_KEY || '').substring(0, 50),
  });
});

app.get('/queue-review', async (req, res) => {
  try {
    const { google } = require('googleapis');

    // Load credentials same way as queue-processor.cjs
    let credentials;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
      console.log('📋 Using GOOGLE_SERVICE_ACCOUNT_BASE64');
      credentials = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    } else {
      console.log('📋 Using GOOGLE_PRIVATE_KEY (fallback)');
      let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
      privateKey = privateKey.replace(/\\n/g, '\n');

      if (privateKey.trim().startsWith('{')) {
        console.log('📋 GOOGLE_PRIVATE_KEY is JSON, parsing...');
        try {
          credentials = JSON.parse(privateKey);
        } catch (e) {
          console.log('📋 JSON parse failed, escaping literal newlines...');
          const fixed = privateKey.replace(/"-----BEGIN[\s\S]*?-----END[^"]*"/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
          });
          credentials = JSON.parse(fixed);
        }
      } else {
        console.log('📋 GOOGLE_PRIVATE_KEY is PEM');
        credentials = {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: privateKey,
        };
      }
    }

    console.log('📋 Credentials loaded, client_email:', credentials.client_email);

    const sheets = google.sheets({ version: 'v4', auth: new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })});

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1N05E3Tahh9APAA-vysvD3HlP3ChISTgPwao9Te5mW18',
      range: 'Queue!A2:M1000',
    });

    const rows = response.data.values || [];
    const COL = { STATUS: 0, COMPANY_ID: 1, INDUSTRY: 2, OPPORTUNITY: 3, DATE: 4, LINK: 5, LOCATION: 6, PUBLISH_DATE: 7, OPP_NAME: 8, DRAFTED_CONTENT: 9, DEMOGRAPHICS: 10, DRAFTED_DATE: 11, ERROR_NOTES: 12 };
    const opportunities = [];

    rows.forEach((row, idx) => {
      const rowIndex = idx + 2;
      if ((row[COL.STATUS] || '').trim() === 'Ready for Review') {
        opportunities.push({
          rowIndex,
          status: row[COL.STATUS] || '',
          companyId: row[COL.COMPANY_ID] || '',
          industry: row[COL.INDUSTRY] || '',
          opportunityType: row[COL.OPPORTUNITY] || '',
          applicationDeadline: row[COL.DATE] || '',
          link: row[COL.LINK] || '',
          location: row[COL.LOCATION] || '',
          publishDate: row[COL.PUBLISH_DATE] || '',
          title: row[COL.OPP_NAME] || '',
          draftedContent: row[COL.DRAFTED_CONTENT] || '',
          demographics: row[COL.DEMOGRAPHICS] || '',
          draftedDate: row[COL.DRAFTED_DATE] || '',
          errorNotes: row[COL.ERROR_NOTES] || '',
        });
      }
    });

    res.json({ opportunities });
  } catch (err) {
    console.error('❌ /queue-review error:', err.message);
    res.status(500).json({ error: 'Failed to fetch queue', details: err.message });
  }
});

app.post('/update-queue', async (req, res) => {
  try {
    const { rowIndex, editedOpportunity } = req.body;

    if (!rowIndex || typeof rowIndex !== 'number' || rowIndex < 2 || rowIndex > 1000) {
      return res.status(400).json({ error: 'Invalid rowIndex' });
    }

    if (!editedOpportunity || typeof editedOpportunity !== 'object') {
      return res.status(400).json({ error: 'Invalid editedOpportunity' });
    }

    const { google } = require('googleapis');

    // Load credentials same way as queue-processor.cjs
    let credentials;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
      credentials = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
    } else {
      let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
      privateKey = privateKey.replace(/\\n/g, '\n');

      if (privateKey.trim().startsWith('{')) {
        credentials = JSON.parse(privateKey);
      } else {
        credentials = {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: privateKey,
        };
      }
    }

    const sheets = google.sheets({ version: 'v4', auth: new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })});

    // Format demographics for sheet
    const demographic = editedOpportunity.demographic || {};
    const demographicsStr = [
      demographic.age?.length ? `Age: ${demographic.age.join(', ')}` : '',
      demographic.genderSexualPreference?.length ? `Gender: ${demographic.genderSexualPreference.join(', ')}` : '',
      demographic.ethnicity?.length ? `Ethnicity: ${demographic.ethnicity.join(', ')}` : '',
      demographic.disability?.length ? `Disability: ${demographic.disability.join(', ')}` : '',
      demographic.lowerSocioEconomicBackground?.length ? `Economic Background: ${demographic.lowerSocioEconomicBackground.join(', ')}` : '',
      typeof editedOpportunity.remote === 'boolean' ? `Remote: ${editedOpportunity.remote ? 'Yes' : 'No'}` : '',
      typeof editedOpportunity.ukWide === 'boolean' ? `UK Wide: ${editedOpportunity.ukWide ? 'Yes' : 'No'}` : '',
    ].filter(Boolean).join('\n');

    const today = new Date().toLocaleDateString('en-GB');

    // Update sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: '1N05E3Tahh9APAA-vysvD3HlP3ChISTgPwao9Te5mW18',
      range: `Queue!A${rowIndex}:M${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[
          'Drafted',
          editedOpportunity.companyID || '',
          editedOpportunity.industry || '',
          editedOpportunity.opportunityType || '',
          editedOpportunity.applicationDeadline || '',
          editedOpportunity.link || '',
          editedOpportunity.location || '',
          editedOpportunity.publishDate || '',
          editedOpportunity.title || '',
          JSON.stringify(editedOpportunity),
          demographicsStr,
          today,
          '',
        ]],
      },
    });

    // Transform and write to Firebase
    const transformedData = transformData(editedOpportunity);
    const docRef = await db.collection('announcements').doc('announcements').collection('list').add(transformedData);

    res.json({
      success: true,
      masterPortalDocId: docRef.id,
      rowUpdated: rowIndex,
    });
  } catch (err) {
    console.error('❌ /update-queue error:', err.message);
    res.status(500).json({ error: 'Failed to update queue', details: err.message });
  }
});

app.listen(config.port, () => {
  console.log(`🚀 API Bridge server listening at http://localhost:${config.port}`);
  console.log(`📊 Health check available at http://localhost:${config.port}/health`);
  console.log(`🔗 Master portal Firebase: ${config.firebaseProjectUrl}`);

  // Start queue processor cron job if Google Sheets credentials are present
  // Accept either: (1) separate GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY (PEM)
  //            or (2) full service account JSON in GOOGLE_SERVICE_ACCOUNT_BASE64 or GOOGLE_PRIVATE_KEY
  const hasGoogleSheetsCreds = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 ||
    (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) ||
    (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.trim().startsWith('{'));

  if (hasGoogleSheetsCreds) {
    const { startQueueProcessor } = require('./queue-processor.cjs');
    startQueueProcessor();
  } else {
    console.log('⚠️  QUEUE PROCESSOR: Skipping — no Google Sheets credentials found.');
  }
});
