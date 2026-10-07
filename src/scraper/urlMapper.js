/**
 * URL Mapper - Maps user intent keywords to KL University website URLs
 * Intelligently identifies which page to scrape based on user query
 * Contains ALL KL University website links organized by category
 */

// ============================================
// COMPLETE KL UNIVERSITY WEBSITE LINKS DIRECTORY
// ============================================

const klhLinks = {
    // Homepage
    homepage: 'https://www.kluniversity.in/',

    // Home
    home: {
        defaultPage: 'https://www.kluniversity.in/default.aspx',
        main: 'https://www.kluniversity.in/'
    },

    // About KLH Section
    aboutKLH: {
        visionMission: 'https://www.kluniversity.in/Mission.aspx',
        introduction: 'https://www.kluniversity.in/intro.aspx',
        leadership: 'https://www.kluniversity.in/mngtl2.aspx',
        formerLeadership: 'https://www.kluniversity.in/former_mngt.aspx',
        chancellorMessage: 'https://www.kluniversity.in/cm1.aspx',
        viceChancellorMessage: 'https://www.kluniversity.in/vcm.aspx',
        hallmarks: 'https://www.kluniversity.in/whyklu.aspx',
        accreditations: 'https://www.kluniversity.in/accr.aspx',
        awards: 'https://www.kluniversity.in/awardss.aspx',
        rankings: 'https://www.kluniversity.in/rankings.aspx',
        campusTour: 'https://www.kluniversity.in/campus-tour.aspx',
        ourLocation: 'https://www.kluniversity.in/vtklu.aspx',
        contactInformation: 'https://www.kluniversity.in/contact.aspx',
        awardOfDegrees: 'https://www.kluniversity.in/site/aofdeg.htm',
        bandExcellentRankingInAriia2021ByMinistryOfEducationsInnovationCellGovtOfIndia: 'https://www.kluniversity.in/pdfs/ARI-U-0020.pdf',
        koneruLakshmaiahEducationFoundationAwarded2ndPrizeIn5thNationalWaterAwardInTheCategoryOfBestInstitutionOtherThanSchoolsAndCollegesInRecognitionOfTheCommendableEffortsInTheAreaOfWaterConservationManagementByDepartmentOfWaterResourcesRiverDevelopmentAndGangaRejuvenationMinistryOfJalShakthiGovtOfIndiaNewDelhi22Oct2024: 'https://www.kluniversity.in/pdfs/wa.jpg',
        klefDeemedToBeUniversityIsTheWinnerOf4thGreenUrjaAndEnergyEfficiencyAwardUnderSkillsDiversityAndOutreachAcademiaExcellenceByIndianChamberOfCommerceNewdelhiOn16thFebruary2024: 'https://www.kluniversity.in/pdfs/green urja.jpeg',
        koneruLakshmaiahEducationFoundationSecuredTheTopPositionNationwideAsPioneersInSpearheadingTheIntroductionOfDigitalLearningMethodsByNcoeNationalCodeOfEducationSummitOn24thNovember2023HeldAtIitDelhi: 'https://www.kluniversity.in/pdfs/nco.jpeg',
        klefDeemedToBeUniversityHasReceivedTheAppreciationAwardUnderBestEnergyEfficientCommercialBuildingsHostelsCategoryInThe7thEditionOfCiiNationalEnergyEfficiencyCircleCompetitionHeldOn2021July2023: 'https://www.kluniversity.in/pdfs/CII AWARD.jpg',
        klefDeemedToBeUniversityHasReceivedThePlatinumBandAGradeInTheGreenRankings2023ByRWordInstitutionRankings: 'https://www.kluniversity.in/pdfs/platinum.jpeg',
        klefDeemedToBeUniversityIsTheWinnerInTheCategoryOfBestWaterManagementInstitutionByWaterDigestWorldWaterAwardsInCoOrdinationWithUnescoMinistryOfJalsakthiAndMinistryOfEnvironmentGovtOfIndia: 'https://www.kluniversity.in/pdfs/water.jpeg',
        klefIsTheWinnerOfInternationalAwardByGreentechInternationalForOutstandingAchievementInEhsEnvironmentHealthAndSafetyBestPracticesJanuary2023: 'https://www.kluniversity.in/pdfs/green.jpeg',
        klefDeemedToBeUniversityGotAndhraPradeshStateEnergyConservationAward2022ItIsAPrestigiousAwardInstitutedIn2022ToCommemorateTheEffortsOfVariousOrganizationsInTheStateOfAndhraPradeshInThisYearApsecmWasAnnouncedTheStateEnergyConservationAwardsDecember2022: 'https://www.kluniversity.in/pdfs/state.jpeg',
        koneruLakshmaiahEducationFoundationDeemedToBeUniversityWasAwardedExcellenceInEnergyManagementByCiiSouthRegionIn2022: 'https://www.kluniversity.in/pdfs/Energy Management.jpg'
    },

    // Governance Section
    governance: {
        executiveCouncil: 'https://www.kluniversity.in/BOM.aspx',
        academicCouncil: 'https://www.kluniversity.in/AC.aspx',
        planningDevelopment: 'https://www.kluniversity.in/PMB.aspx',
        financeCommittee: 'https://www.kluniversity.in/FC.aspx',
        boardOfStudies: 'https://www.kluniversity.in/BOS.aspx',
        organogram: 'https://www.kluniversity.in/admnbod.aspx',
        bosMembers: 'https://www.kluniversity.in/bosmembers.aspx',
        pAndD: 'https://www.kluniversity.in/planning2/index.html'
    },

    // Admissions Section
    admissions: {
        whyJoinKlef: 'https://www.kluniversity.in/Why-KLU.aspx',
        faqs: 'https://www.kluniversity.in/faq.aspx',
        kleee2026: 'https://www.kluniversity.in/howto1.aspx',
        entryRequirements: 'https://www.kluniversity.in/entry.aspx',
        hostelFeeParticulars: 'https://www.kluniversity.in/hfee.aspx',
        feeStructure: 'https://www.kluniversity.in/sships3.aspx',
        pgEntryRequirements: 'https://www.kluniversity.in/PGEntry.aspx',
        pgApplicationProcedure: 'https://www.kluniversity.in/pghowto.aspx',
        phdAdmission: 'https://www.kluniversity.in/applyonline2.aspx',
        transferAdmission: 'https://www.kluniversity.in/Transfer-of-Admission.aspx',
        main: 'https://www.kluniversity.in/admissions/',
        internationalAdmissions: 'https://www.kluniversity.in/ir/default.aspx',
        scholarships: 'https://www.kluniversity.in/scholarships.aspx',
        programmesOffered: 'https://www.kluniversity.in/admissions.aspx',
        computerScienceApplications: 'https://www.kluniversity.in/csa/index.html',
        nationalAdmissions: 'http://admissions.kluniversity.in/',
        international: 'https://www.kluniversity.in/international-admissions/',
        klecet2026Results: 'https://www.kluniversity.in/KLECET-2026-result.aspx',
        kleee2026PhaseIiiResults: 'https://www.kluniversity.in/kleee-2026-phase-iii-results.aspx',
        klneet2026Results: 'https://www.kluniversity.in/KLNEET-2026-result.aspx',
        klhat2026PhaseIResults: 'https://www.kluniversity.in/KLHAT-2026-result.aspx',
        notificationForPhDAdmission202627OddSemester: 'https://www.kluniversity.in/pdfs/phd-notifications/2026-27-Odd-Semester.pdf',
        klneet2026AdmitCards: 'https://www.kluniversity.in/klneet-2026-hall-tickets.aspx',
        kleee2026PhaseIiiAdmitCards: 'https://www.kluniversity.in/kleee-2026-p3-hall-tickets.aspx',
        klmat2026PhaseIResults: 'https://www.kluniversity.in/KLMAT-2026-result.aspx',
        kleee2026PhaseIResults: 'https://www.kluniversity.in/kleee-2026-phase-i-results.aspx',
        kleee2026PhaseIAdmitCards: 'https://www.kluniversity.in/kleee-2026-p1-hall-tickets.aspx',
        facultyPositions: 'https://www.kluniversity.in/careers.aspx',
        nonTeachingPositions: 'https://www.kluniversity.in/Careers-NTS.aspx',
        koneruLakshmaiahEducationFoundationDeemedToBeUniversityWasAwardedSecondPrizeForApplicationOfExcellenceInWaterWaterManagementByCiiSouthRegionIn2022: 'https://www.kluniversity.in/pdfs/Watermangement.jpg',
        koneruLakshmaiahEducationFoundationDeemedToBeUniversityWasAwardedThirdPrizeForApplicationOfExcellenceInWasteManagementByCiiSouthRegionIn2022: 'https://www.kluniversity.in/pdfs/Waste Management.jpg',
        admissionDetailsCategoryWise: 'https://www.kluniversity.in/policy.aspx',
        feedbackForm: 'https://www.kluniversity.in/feedback.aspx'
    },

    // Academics Section
    academics: {
        ugPrograms: 'https://www.kluniversity.in/programmes.aspx',
        pgPrograms: 'https://www.kluniversity.in/PGProgrames.aspx',
        academicsAtKlef: 'https://www.kluniversity.in/site/index.htm',
        academicCalendar: 'https://www.kluniversity.in/site/acadcal.htm',
        flexibilities: 'https://www.kluniversity.in/site/flexibility.htm',
        grading: 'https://www.kluniversity.in/site/grading.htm',
        electives: 'https://www.kluniversity.in/site/eleccourse.htm',
        rulesRegulations: 'https://www.kluniversity.in/site/acadstruct.htm',
        teachingEvaluation: 'https://www.kluniversity.in/site/teach-eval.htm',
        academicStaffCollege: 'https://www.kluniversity.in/staffclg/default.aspx',
        link3PartWebinarSeriesWritingAnAcademicDissertation: 'https://www.kluniversity.in/rnews.aspx?id=3622'
    },

    // Academic Departments
    departments: {
        artificialIntelligenceDataScience: 'https://www.kluniversity.in/ainds/default.aspx',
        bioTechnology: 'https://www.kluniversity.in/bt/default.aspx',
        civilEngineering: 'https://www.kluniversity.in/ce/default.aspx',
        cse: 'https://www.kluniversity.in/cse1/default.aspx',
        cseIt: 'https://www.kluniversity.in/cseit/default.aspx',
        eee: 'https://www.kluniversity.in/eee/default.aspx',
        ece: 'https://www.kluniversity.in/ece/default.aspx',
        iot: 'https://www.kluniversity.in/iot/default.aspx',
        mechanicalEngineering: 'https://www.kluniversity.in/me/default.aspx',
        arts: 'https://www.kluniversity.in/ba/default.aspx',
        chemistry: 'https://www.kluniversity.in/chemistrynew/default.aspx',
        foodTechnology: 'https://www.kluniversity.in/ft/index.html',
        mathematics: 'https://www.kluniversity.in/maths/default.aspx',
        physics: 'https://www.kluniversity.in/physics/default.aspx',
        architecture: 'https://www.kluniversity.in/architecture/index.html',
        mba: 'https://www.kluniversity.in/mba/default.aspx',
        fineArts: 'https://www.kluniversity.in/finearts/default.aspx',
        pharmacy: 'https://www.kluniversity.in/pharmacy/Default.aspx',
        law: 'https://www.kluniversity.in/law/default.aspx',
        agriculture: 'https://www.kluniversity.in/Agriculture/default.aspx',
        liberalArts: 'https://www.kluniversity.in/Liberal Atrs/index.html'
    },

    // Faculty and Careers Section
    facultyCareers: {
        careers: 'https://www.kluniversity.in/jobs.aspx'
    },

    // Placements Section
    placements: {
        placements: 'https://www.kluniversity.in/placem.aspx'
    },

    // Research and Innovation Section
    researchInnovation: {
        researchDevelopment: 'https://www.kluniversity.in/rnd/default.aspx',
        globalConnect: 'https://www.kluniversity.in/IR/default.aspx',
        industrialPracticeSchool: 'https://www.kluniversity.in/ips/default.aspx',
        innovationIncubationEntrepreneurship: 'https://www.kluniversity.in/edcnew/default.aspx',
        extensionActivities: 'https://www.kluniversity.in/Extension-Activities.aspx',
        clarivateResearchWorkshopResearchingGlobalPerspectivesWithInternationalNewsCoverage: 'https://www.kluniversity.in/rnews.aspx?id=3624',
        smarterResearchWorkflowsWithProquestDigitalCollection: 'https://www.kluniversity.in/rnews.aspx?id=3623',
        callForThePositionOfJuniorResearchFellowJrfUnderTheAnrfSponsoredProject: 'https://www.kluniversity.in/rnews.aspx?id=3621',
        researchCategorizationAndTheValueOfStructuredData: 'https://www.kluniversity.in/rnews.aspx?id=3620',
        researchSmartAndCiteSmartWithEndnote2025: 'https://www.kluniversity.in/rnews.aspx?id=3619',
        redefineTheEbookReadingExperienceWithProquestEbooks: 'https://www.kluniversity.in/rnews.aspx?id=3618',
        centreForExtensionActivities: 'https://www.kluniversity.in/cea/default.aspx'
    },

    // Facilities Section
    facilities: {
        library: 'https://www.kluniversity.in/lib/default.aspx',
        campusInfrastructureAwards: 'https://www.kluniversity.in/awa.aspx',
        theDataCenter: 'https://www.kluniversity.in/planning2/datacenter1.html',
        transport: 'https://www.kluniversity.in/transp.aspx',
        lectureCapturingStudio: 'https://www.kluniversity.in/planning2/studio.html',
        museum: 'https://www.kluniversity.in/planning2/museum.html',
        animalHouse: 'https://www.kluniversity.in/planning2/ah.html',
        artGallery: 'https://www.kluniversity.in/planning2/art.html',
        audiovisualCenter: 'https://www.kluniversity.in/planning2/avc.html',
        mootCourt: 'https://www.kluniversity.in/planning2/court.html',
        protectedDrinkingWater: 'https://www.kluniversity.in/planning2/drink.html',
        powerBackup: 'https://www.kluniversity.in/planning2/pb.html',
        businessLab: 'https://www.kluniversity.in/planning2/bl.html',
        theater: 'https://www.kluniversity.in/planning2/the.html',
        itFacilities: 'https://www.kluniversity.in/planning2/it.html',
        fireSafety: 'https://www.kluniversity.in/planning2/fire.html',
        stp: 'https://www.kluniversity.in/planning2/stp.html',
        helpDesk: 'https://www.kluniversity.in/planning2/help.html',
        cafeteria: 'https://www.kluniversity.in/planning2/cafteria.html',
        admissionsHelpDesk: 'https://www.kluniversity.in/hdesk21.aspx'
    },

    // Campus Life Section
    campusLife: {
        physicalEducation: 'https://www.kluniversity.in/sports/default.aspx',
        hostels: 'https://www.kluniversity.in/hostels/default.aspx',
        nss: 'https://www.kluniversity.in/nss/',
        ncc: 'https://www.kluniversity.in/ncc/',
        sac: 'http://sac.kluniversity.in',
        svr: 'https://www.kluniversity.in/svr/index.html',
        cea: 'https://www.kluniversity.in/cea/',
        yrc: 'https://www.kluniversity.in/yrc/',
        wdc: 'https://www.kluniversity.in/wdc/',
        studentMagazines: 'https://www.kluniversity.in/Student-Magazine.aspx',
        newsletter: 'https://www.kluniversity.in/klupanorama.aspx',
        antiRagging: 'https://www.kluniversity.in/antirag.aspx',
        antiRagging2: 'https://www.kluniversity.in/pdfs/antiragging.pdf',
        womenDevelopmentCellWdc: 'https://www.kluniversity.in/wdc/index.html',
        youthRedCross: 'https://www.kluniversity.in/yrc/index.html',
        nationalServiceScheme: 'https://www.kluniversity.in/nss/default.aspx',
        nationalCadetCorps: 'https://www.kluniversity.in/ncc/default.aspx',
        studentActivityCenter: 'http://sac.kluniversity.in/'
    },

    // Alumni Section
    alumni: {
        alumniPortal: 'https://alumni.kluniversity.in/',
        alumniPortalNoSlash: 'https://alumni.kluniversity.in'
    },

    // User and Utility Pages
    userPages: {
        mail: 'https://outlook.office.com/mail/',
        examSection: 'https://www.kluniversity.in/es.aspx?id=0',
        lms: 'https://lms.kluniversity.in/',
        erp: 'https://newerp.kluniversity.in/'
    },

    // Compliance and Committees Section
    complianceCommittees: {
        iqac: 'https://www.kluniversity.in/IQAC',
        sdg: 'https://www.kluniversity.in/sdg/',
        statutoryCellsCommittees: 'https://www.kluniversity.in/satu.aspx',
        staffGrievances: 'https://www.kluniversity.in/Staff-Grievances.aspx',
        womenGrievances: 'https://www.kluniversity.in/pdfs/og.pdf',
        sdg2: 'https://www.kluniversity.in/SDG.aspx',
        womenGrievancesPolicy: 'https://www.kluniversity.in/pdfs/Women Grievances Policy.pdf',
        statutoryCommitteesAndCells: 'https://www.kluniversity.in/Statutory-Committees-Cells.aspx',
        privacyPolicy: 'https://www.kluniversity.in/privacy.aspx',
        studentStrength: 'https://www.kluniversity.in/stren.aspx',
        uniformMentalHealthAndSuicidePrevention: 'https://www.kluniversity.in/Uniform-Mental-Health-and-Suicide-Prevention.aspx'
    },

    // Compliance and Government Links
    complianceGovernment: {
        nationalAcademicDepository: 'https://nad.gov.in/',
        aicteFeedback: 'https://www.aicte-india.org/feedback/index.php',
        ugcESamadhanPortal: 'https://samadhaan.ugc.ac.in'
    },

    // News and Events Section
    newsEvents: {
        researchNewsMore: 'https://www.kluniversity.in/morernews.aspx',
        view3616: 'https://www.kluniversity.in/view.aspx?id=3616',
        view3597: 'https://www.kluniversity.in/view.aspx?id=3597',
        view3596: 'https://www.kluniversity.in/view.aspx?id=3596',
        view3571: 'https://www.kluniversity.in/view.aspx?id=3571',
        view3570: 'https://www.kluniversity.in/view.aspx?id=3570',
        view3569: 'https://www.kluniversity.in/view.aspx?id=3569',
        view3568: 'https://www.kluniversity.in/view.aspx?id=3568',
        view3559: 'https://www.kluniversity.in/view.aspx?id=3559',
        view3558: 'https://www.kluniversity.in/view.aspx?id=3558',
        view3557: 'https://www.kluniversity.in/view.aspx?id=3557',
        view3556: 'https://www.kluniversity.in/view.aspx?id=3556',
        view3555: 'https://www.kluniversity.in/view.aspx?id=3555',
        view3554: 'https://www.kluniversity.in/view.aspx?id=3554',
        view3553: 'https://www.kluniversity.in/view.aspx?id=3553',
        view3552: 'https://www.kluniversity.in/view.aspx?id=3552',
        view3551: 'https://www.kluniversity.in/view.aspx?id=3551',
        view3550: 'https://www.kluniversity.in/view.aspx?id=3550',
        view3549: 'https://www.kluniversity.in/view.aspx?id=3549',
        view3548: 'https://www.kluniversity.in/view.aspx?id=3548',
        view3547: 'https://www.kluniversity.in/view.aspx?id=3547',
        newsMore: 'https://www.kluniversity.in/morenews.aspx',
        newsMedia: 'https://www.kluniversity.in/news.aspx'
    },

    // KLEF Off Campuses
    campuses: {
        aziznagar: 'https://klh.edu.in/aziznagar/',
        bachupally: 'https://klh.edu.in/bachupally/'
    },

    // Social and External Contact Links
    social: {
        facebook: 'https://www.facebook.com/KLUniversity/',
        twitter: 'https://twitter.com/kluniversity?lang=en',
        youtube: 'https://www.youtube.com/kluniversitylive',
        linkedin: 'https://www.linkedin.com/school/1353501/',
        instagram: 'https://www.instagram.com/kluniversityofficial/',
        pinterest: 'https://in.pinterest.com/kluniversityofficial/',
        whatsapp: 'https://api.whatsapp.com/send/?phone=917815926834&text&app_absent=0'
    },

    // External Resources
    externalResources: {
        onlineEducation: 'https://www.kluonline.edu.in',
        skillProgression: 'https://skilldevelopment-kluniversity.in/',
        acicKlStartupsFoundation: 'https://www.acickl.in/',
        kltif: 'https://www.kltif.in/',
        youth4workSkillTest: 'https://www.youth4work.com/onlinetalenttest',
        healthyLifestyleVideo: 'https://youtu.be/L8d49DN0RD4'
    },

    // Other Sections
    other: {
        counselling2026Booklet: 'https://www.kluniversity.in/pdfs/cb2.pdf',
        klefDeemedToBeUniversityIsThe2ndEducationalInstitutionInIndiaToBecomeMemberOfGlobalDesignThinkingAllianceGdta: 'https://www.kluniversity.in/pdfs/Achevvement-01(2).jpg',
        klefDeemedToBeUniversityHaveRecievedDiamondQsiGaugeIndianUniversityRating: 'https://www.kluniversity.in/pdfs/QS I-GAUGE University Certificate_KL UNIVERSITY.pdf',
        photoGalleries: 'https://www.kluniversity.in/PGalleries.aspx',
        mou: 'https://www.kluniversity.in/pdfs/Mou.pdf',
        moa: 'https://www.kluniversity.in/pdfs/MOA.pdf',
        approvals: 'https://www.kluniversity.in/approval.aspx',
        codeOfConduct: 'https://www.kluniversity.in/cc.aspx',
        womenHelpline: 'https://www.kluniversity.in/pdfs/wh.pdf',
        icc: 'https://www.kluniversity.in/pdfs/oicc.pdf',
        nispPolicy: 'https://www.kluniversity.in/pdfs/NISP-Policy.pdf',
        nirfData: 'https://www.kluniversity.in/NIRF-Data.aspx',
        ugcMandatoryDisclosure: 'https://www.kluniversity.in/pdfs/umd.pdf',
        aicteMandatoryDisclosure: 'https://www.kluniversity.in/pdfs/dis.pdf',
        rti: 'https://www.kluniversity.in/RTI/',
        technologySkillingPartners: 'https://www.kluniversity.in/Technical-Partners.aspx',
        womenForumPolicy: 'https://www.kluniversity.in/pdfs/Women Forum Policy.pdf',
        northIndiaCell: 'https://www.kluniversity.in/northcell.aspx',
        bestPractices: 'https://www.kluniversity.in/Practices.aspx'
    }

};

// ============================================
// URL MAPPINGS FOR QUERY MATCHING
// ============================================

const categoryKeywords = {
    home: ['home', 'homepage', 'main page'],
    about: ['about', 'history', 'introduction', 'vision', 'mission', 'leadership', 'ranking', 'rankings', 'award', 'awards', 'accreditation', 'naac', 'campus tour', 'location', 'contact'],
    governance: ['governance', 'executive council', 'academic council', 'planning', 'finance committee', 'board of studies', 'bos', 'organogram', 'management'],
    admissions: ['admission', 'admissions', 'apply', 'application', 'join', 'register', 'enroll', 'enrollment', 'kleee', 'entrance'],
    fees: ['fee', 'fees', 'tuition', 'cost', 'price', 'payment', 'waiver', 'concession'],
    scholarships: ['scholarship', 'scholarships', 'merit', 'financial aid', 'fee waiver', 'concession'],
    exams: ['exam', 'examination', 'result', 'results', 'admit card', 'hall ticket', 'kleee', 'klecet', 'klneet', 'klhat', 'klmat'],
    programs: ['program', 'programs', 'programme', 'programmes', 'course', 'courses', 'degree', 'btech', 'mtech', 'mba', 'bba', 'bca', 'mca', 'phd', 'curriculum', 'syllabus'],
    academics: ['academic', 'academics', 'calendar', 'grading', 'electives', 'rules', 'regulations', 'teaching', 'evaluation', 'staff college'],
    departments: ['department', 'departments', 'college', 'school', 'branch', 'engineering'],
    cse: ['cse', 'computer science', 'computer science engineering', 'coding', 'programming', 'software'],
    ece: ['ece', 'electronics', 'communication', 'electronics communication'],
    eee: ['eee', 'electrical', 'electronics engineering'],
    mba: ['mba', 'business school', 'management', 'finance', 'marketing', 'hr'],
    faculty: ['faculty', 'faculties', 'professor', 'professors', 'teacher', 'teachers', 'staff', 'teaching', 'lecturer', 'career', 'careers', 'jobs'],
    placements: ['placement', 'placements', 'placed', 'company', 'companies', 'package', 'salary', 'ctc', 'recruiter', 'recruiters', 'hiring'],
    research: ['research', 'r&d', 'rnd', 'innovation', 'incubation', 'entrepreneurship', 'global connect', 'industrial practice', 'extension activities'],
    facilities: ['facility', 'facilities', 'infrastructure', 'library', 'transport', 'bus', 'cafeteria', 'data center', 'it facilities', 'hostel', 'hostels', 'help desk'],
    campusLife: ['campus life', 'sports', 'physical education', 'hostel', 'hostels', 'nss', 'ncc', 'sac', 'student activity', 'magazine', 'newsletter', 'anti ragging'],
    alumni: ['alumni', 'alumnus', 'graduates'],
    login: ['login', 'portal', 'mail', 'email', 'exam section', 'lms', 'erp', 'student portal'],
    compliance: ['compliance', 'iqac', 'sdg', 'committee', 'committees', 'grievance', 'policy', 'privacy', 'student strength', 'mental health'],
    government: ['nad', 'aicte', 'ugc', 'samadhan', 'government'],
    news: ['news', 'events', 'media', 'press', 'updates', 'read more'],
    campus: ['aziznagar', 'aziz nagar', 'bachupally', 'bachu pally', 'off campus', 'hyderabad'],
    social: ['facebook', 'twitter', 'youtube', 'linkedin', 'instagram', 'pinterest', 'whatsapp', 'social media'],
    external: ['online education', 'skill', 'skill development', 'acic', 'startup', 'kltif', 'youth4work', 'healthy lifestyle'],
    other: ['photo gallery', 'gallery', 'mou', 'moa', 'approval', 'code of conduct', 'nirf', 'rti', 'technical partners', 'best practices', 'north india cell']
};

const linkKeywordOverrides = {
    feeStructure: ['fee structure', 'fees', 'tuition fee', 'fee waiver', 'concession', 'scholarship fee'],
    hostelFeeParticulars: ['hostel fee', 'hostel fees', 'mess fee', 'room rent', 'accommodation fee'],
    main: ['main', 'admission', 'admissions', 'apply online', 'online application'],
    entryRequirements: ['entry requirements', 'eligibility', 'qualification', 'criteria'],
    pgEntryRequirements: ['pg entry requirements', 'pg eligibility', 'postgraduate eligibility'],
    kleee2026: ['kleee', 'kleee 2026', 'entrance exam'],
    kleee2026PhaseIiiAdmitCards: ['kleee phase iii admit card', 'kleee phase 3 hall ticket', 'kleee admit card'],
    kleee2026PhaseIAdmitCards: ['kleee phase i admit card', 'kleee phase 1 hall ticket', 'kleee admit card'],
    kleee2026PhaseIiiResults: ['kleee phase iii result', 'kleee phase 3 result', 'kleee result'],
    kleee2026PhaseIResults: ['kleee phase i result', 'kleee phase 1 result', 'kleee result'],
    computerScienceApplications: ['csa', 'computer science applications', 'bca', 'mca'],
    cse: ['cse', 'computer science engineering', 'computer science and engineering'],
    cseIt: ['csit', 'cse it', 'computer science information technology'],
    ece: ['ece', 'electronics and communication engineering'],
    eee: ['eee', 'electrical and electronics engineering'],
    mba: ['mba', 'business school', 'klbs'],
    careers: ['careers', 'career', 'jobs', 'faculty', 'teacher', 'professor', 'lecturer'],
    facultyPositions: ['faculty positions', 'faculty jobs', 'teacher jobs', 'professor jobs'],
    placements: ['placements', 'placement', 'highest package', 'average package', 'companies', 'recruiters'],
    researchDevelopment: ['research and development', 'r&d', 'rnd'],
    innovationIncubationEntrepreneurship: ['ed cell', 'entrepreneurship', 'startup', 'incubation', 'innovation cell'],
    transport: ['transport', 'transportation', 'bus', 'pickup', 'drop', 'route'],
    admissionsHelpDesk: ['admission help desk', 'admission contact', 'admissions contact', 'help desk'],
    library: ['library', 'books'],
    hostels: ['hostel', 'hostels', 'accommodation', 'mess', 'room'],
    physicalEducation: ['sports', 'physical education', 'games'],
    examSection: ['exam section', 'exams', 'results', 'grades'],
    lms: ['lms', 'learning management system', 'online learning'],
    erp: ['erp', 'student portal', 'attendance', 'marks'],
    iqac: ['iqac', 'quality assurance'],
    staffGrievances: ['staff grievance', 'staff grievances', 'complaint'],
    nirfData: ['nirf', 'nirf data'],
    codeOfConduct: ['code of conduct', 'rules', 'discipline'],
    contactInformation: ['contact', 'phone', 'email', 'address'],
    ourLocation: ['location', 'address', 'where', 'directions', 'map'],
    campusTour: ['campus tour', 'virtual tour'],
    facebook: ['facebook'],
    twitter: ['twitter', 'x'],
    youtube: ['youtube', 'video', 'channel'],
    linkedin: ['linkedin'],
    instagram: ['instagram'],
    whatsapp: ['whatsapp', 'phone', 'contact']
};

const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
    'in', 'is', 'it', 'of', 'on', 'or', 'the', 'this', 'to', 'was', 'with',
    'all', 'can', 'category', 'department', 'departments', 'do', 'does', 'good',
    'government', 'govt', 'india', 'institution', 'institutions', 'kl', 'klef',
    'klu', 'university'
]);

function wordsFromKey(key) {
    return key
        .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
        .replace(/([0-9])([A-Za-z])/g, '$1 $2')
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordMatches(query, keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();
    if (!normalizedKeyword || STOP_WORDS.has(normalizedKeyword)) return false;
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(normalizedKeyword)}([^a-z0-9]|$)`, 'i');
    return pattern.test(query);
}

function createMappings(linkGroup, category, sharedKeywords = [], categoryOverrides = {}) {
    return Object.entries(linkGroup).map(([key, url]) => ({
        keywords: [...new Set([...wordsFromKey(key), ...(linkKeywordOverrides[key] || [])])],
        url,
        category: categoryOverrides[key] || category
    }));
}

const admissionsCategoryOverrides = {
    hostelFeeParticulars: 'fees',
    feeStructure: 'fees',
    scholarships: 'scholarships',
    klecet2026Results: 'exams',
    kleee2026PhaseIiiResults: 'exams',
    klneet2026Results: 'exams',
    klhat2026PhaseIResults: 'exams',
    klneet2026AdmitCards: 'exams',
    kleee2026PhaseIiiAdmitCards: 'exams',
    klmat2026PhaseIResults: 'exams',
    kleee2026PhaseIResults: 'exams',
    kleee2026PhaseIAdmitCards: 'exams',
    facultyPositions: 'faculty',
    nonTeachingPositions: 'faculty'
};

const departmentCategoryOverrides = {
    cse: 'cse',
    cseIt: 'cse',
    computerScienceApplications: 'cse',
    ece: 'ece',
    eee: 'eee',
    mba: 'mba'
};

const userPageCategoryOverrides = {
    examSection: 'exams',
    lms: 'login',
    erp: 'login',
    mail: 'login'
};

const urlMappings = [
    // Priority mappings keep important answers first.
    { keywords: ['contact', 'phone', 'email', 'address'], url: klhLinks.aboutKLH.contactInformation, category: 'contact' },
    { keywords: ['location', 'where', 'map', 'directions'], url: klhLinks.aboutKLH.ourLocation, category: 'campus' },
    { keywords: categoryKeywords.home, url: klhLinks.home.main, category: 'home' },
    { keywords: ['about', 'history', 'introduction', 'about kl', 'about klef'], url: klhLinks.aboutKLH.introduction, category: 'about' },
    { keywords: ['vision', 'mission'], url: klhLinks.aboutKLH.visionMission, category: 'about' },
    { keywords: ['ranking', 'rankings', 'rank', 'nirf'], url: klhLinks.aboutKLH.rankings, category: 'about' },
    { keywords: ['award', 'awards', 'recognition'], url: klhLinks.aboutKLH.awards, category: 'about' },
    { keywords: ['governance', 'management', 'executive council', 'board'], url: klhLinks.governance.executiveCouncil, category: 'governance' },
    { keywords: ['kleee admit card', 'kleee hall ticket', 'kleee phase iii admit card', 'kleee phase 3 hall ticket'], url: klhLinks.admissions.kleee2026PhaseIiiAdmitCards, category: 'exams' },
    { keywords: ['kleee result', 'kleee results', 'kleee phase iii result', 'kleee phase 3 result'], url: klhLinks.admissions.kleee2026PhaseIiiResults, category: 'exams' },
    { keywords: ['admission', 'admissions', 'apply', 'application', 'online application', 'join', 'register'], url: klhLinks.admissions.main, category: 'admissions' },
    { keywords: ['hostel fee', 'hostel fees', 'mess fee', 'accommodation fee'], url: klhLinks.admissions.hostelFeeParticulars, category: 'fees' },
    { keywords: ['fee', 'fees', 'fee structure', 'tuition', 'cost', 'concession', 'waiver'], url: klhLinks.admissions.feeStructure, category: 'fees' },
    { keywords: ['program', 'programs', 'course', 'courses', 'degree', 'btech'], url: klhLinks.admissions.programmesOffered, category: 'programs' },
    { keywords: ['academic', 'academics', 'academic calendar', 'grading', 'electives'], url: klhLinks.academics.academicsAtKlef, category: 'academics' },
    { keywords: ['department', 'departments', 'branches', 'engineering branches'], url: klhLinks.departments.cse, category: 'departments' },
    { keywords: ['faculty', 'faculties', 'professor', 'professors', 'teacher', 'teachers', 'staff', 'lecturer'], url: klhLinks.facultyCareers.careers, category: 'faculty' },
    { keywords: ['placement', 'placements', 'highest package', 'average package', 'companies', 'recruiters'], url: klhLinks.placements.placements, category: 'placements' },
    { keywords: ['research', 'r&d', 'rnd'], url: klhLinks.researchInnovation.researchDevelopment, category: 'research' },
    { keywords: ['facility', 'facilities', 'infrastructure'], url: klhLinks.facilities.library, category: 'facilities' },
    { keywords: ['campus life', 'student life', 'sports', 'hostel', 'hostels'], url: klhLinks.campusLife.hostels, category: 'campusLife' },
    { keywords: ['alumni'], url: klhLinks.alumni.alumniPortal, category: 'alumni' },
    { keywords: ['cse', 'computer science', 'computer science engineering'], url: klhLinks.departments.cse, category: 'cse' },
    { keywords: ['ece', 'electronics and communication'], url: klhLinks.departments.ece, category: 'ece' },
    { keywords: ['eee', 'electrical and electronics'], url: klhLinks.departments.eee, category: 'eee' },
    { keywords: ['mba', 'business school', 'management'], url: klhLinks.departments.mba, category: 'mba' },
    { keywords: ['erp', 'student portal', 'attendance', 'marks'], url: klhLinks.userPages.erp, category: 'login' },
    { keywords: ['lms', 'learning management system'], url: klhLinks.userPages.lms, category: 'login' },
    { keywords: ['exam', 'exam section', 'examination'], url: klhLinks.userPages.examSection, category: 'exams' },
    { keywords: ['iqac', 'quality assurance'], url: klhLinks.complianceCommittees.iqac, category: 'compliance' },
    { keywords: ['news', 'events', 'media'], url: klhLinks.newsEvents.newsMedia, category: 'news' },
    { keywords: ['facebook'], url: klhLinks.social.facebook, category: 'social' },
    { keywords: ['twitter', 'x'], url: klhLinks.social.twitter, category: 'social' },
    { keywords: ['youtube', 'video', 'channel'], url: klhLinks.social.youtube, category: 'social' },
    { keywords: ['linkedin'], url: klhLinks.social.linkedin, category: 'social' },
    { keywords: ['instagram'], url: klhLinks.social.instagram, category: 'social' },
    { keywords: ['whatsapp'], url: klhLinks.social.whatsapp, category: 'social' },

    // About KLH
    ...createMappings(klhLinks.home, 'home', categoryKeywords.home),
    ...createMappings(klhLinks.aboutKLH, 'about', categoryKeywords.about),

    // Governance
    ...createMappings(klhLinks.governance, 'governance', categoryKeywords.governance),

    // Admissions, fees, exams, scholarships, and programs
    ...createMappings(klhLinks.admissions, 'admissions', categoryKeywords.admissions, admissionsCategoryOverrides),
    ...createMappings(klhLinks.academics, 'academics', categoryKeywords.academics),

    // Academic departments
    ...createMappings(klhLinks.departments, 'departments', categoryKeywords.departments, departmentCategoryOverrides),

    // Faculty, placements, research, and facilities
    ...createMappings(klhLinks.facultyCareers, 'faculty', categoryKeywords.faculty),
    ...createMappings(klhLinks.placements, 'placements', categoryKeywords.placements),
    ...createMappings(klhLinks.researchInnovation, 'research', categoryKeywords.research),
    ...createMappings(klhLinks.facilities, 'facilities', categoryKeywords.facilities),

    // Campus life, alumni, portals, compliance, news, social, and other links
    ...createMappings(klhLinks.campusLife, 'campusLife', categoryKeywords.campusLife),
    ...createMappings(klhLinks.alumni, 'alumni', categoryKeywords.alumni),
    ...createMappings(klhLinks.userPages, 'login', categoryKeywords.login, userPageCategoryOverrides),
    ...createMappings(klhLinks.complianceCommittees, 'compliance', categoryKeywords.compliance),
    ...createMappings(klhLinks.complianceGovernment, 'government', categoryKeywords.government),
    ...createMappings(klhLinks.newsEvents, 'news', categoryKeywords.news),
    ...createMappings(klhLinks.campuses, 'campus', categoryKeywords.campus),
    ...createMappings(klhLinks.social, 'social', categoryKeywords.social),
    ...createMappings(klhLinks.externalResources, 'external', categoryKeywords.external),
    ...createMappings(klhLinks.other, 'other', categoryKeywords.other)
];

/**
 * Find relevant URLs based on user query
 * Returns the strongest URLs from each matched category (max 4 total)
 * @param {string} query - User's question
 * @returns {Object} - Object containing matched URLs and categories
 */
function findRelevantUrls(query) {
    const lowerQuery = query.toLowerCase();
    const matchedCategories = new Set();
    const matchedUrls = new Set();

    for (const mapping of urlMappings) {
        const isDocument = /\.(pdf|jpg|jpeg|png)$/i.test(mapping.url);
        const wantsDocument = /pdf|document|certificate|notification|award|result|admit|hall ticket|nirf|data/i.test(lowerQuery);
        if (isDocument && !wantsDocument) continue;

        for (const keyword of mapping.keywords) {
            if (keywordMatches(lowerQuery, keyword)) {
                matchedCategories.add(mapping.category);
                matchedUrls.add(mapping.url);
                break;
            }
        }
    }

    if (matchedUrls.size === 0) {
        matchedUrls.add(klhLinks.homepage);
        matchedUrls.add(klhLinks.admissions.main);
        matchedCategories.add('home');
        matchedCategories.add('admissions');
    }

    console.log(`Debug: Matched Categories: ${[...matchedCategories].join(', ')}`);

    return {
        urls: Array.from(matchedUrls).slice(0, 4),
        categories: [...matchedCategories]
    };
}

/**
 * Get all KL University links organized by category
 * @returns {Object} - All KL University links
 */
function getAllLinks() {
    return klhLinks;
}

module.exports = { findRelevantUrls, urlMappings, klhLinks, getAllLinks };
