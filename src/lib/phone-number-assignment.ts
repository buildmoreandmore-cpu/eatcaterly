interface ZipCodeMapping {
  zipCode: string
  areaCode: string
  city: string
  state: string
}

interface PhoneNumber {
  id: string
  phoneNumber: string
  areaCode: string
  isAvailable: boolean
  assignedToZipCode?: string
  createdAt: Date
}

// Comprehensive US Zip Code Prefix to Area Code Mapping
// Maps first 3 digits of zip code to common area codes in that region
const ZIP_PREFIX_TO_AREA_CODE: Record<string, { areaCode: string; state: string; region: string }> = {
  // Northeast (00x-09x)
  '006': { areaCode: '787', state: 'PR', region: 'Puerto Rico' },
  '007': { areaCode: '787', state: 'PR', region: 'Puerto Rico' },
  '008': { areaCode: '340', state: 'VI', region: 'Virgin Islands' },
  '009': { areaCode: '787', state: 'PR', region: 'Puerto Rico' },
  '010': { areaCode: '413', state: 'MA', region: 'Massachusetts' },
  '011': { areaCode: '413', state: 'MA', region: 'Massachusetts' },
  '012': { areaCode: '413', state: 'MA', region: 'Massachusetts' },
  '013': { areaCode: '413', state: 'MA', region: 'Massachusetts' },
  '014': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '015': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '016': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '017': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '018': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '019': { areaCode: '413', state: 'MA', region: 'Massachusetts' },
  '020': { areaCode: '617', state: 'MA', region: 'Boston' },
  '021': { areaCode: '617', state: 'MA', region: 'Boston' },
  '022': { areaCode: '617', state: 'MA', region: 'Boston' },
  '023': { areaCode: '617', state: 'MA', region: 'Massachusetts' },
  '024': { areaCode: '617', state: 'MA', region: 'Massachusetts' },
  '025': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '026': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '027': { areaCode: '508', state: 'MA', region: 'Massachusetts' },
  '030': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '031': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '032': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '033': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '034': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '035': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '036': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '037': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '038': { areaCode: '603', state: 'NH', region: 'New Hampshire' },
  '039': { areaCode: '207', state: 'ME', region: 'Maine' },
  '040': { areaCode: '207', state: 'ME', region: 'Maine' },
  '041': { areaCode: '207', state: 'ME', region: 'Maine' },
  '042': { areaCode: '207', state: 'ME', region: 'Maine' },
  '043': { areaCode: '207', state: 'ME', region: 'Maine' },
  '044': { areaCode: '207', state: 'ME', region: 'Maine' },
  '045': { areaCode: '207', state: 'ME', region: 'Maine' },
  '046': { areaCode: '207', state: 'ME', region: 'Maine' },
  '047': { areaCode: '207', state: 'ME', region: 'Maine' },
  '048': { areaCode: '207', state: 'ME', region: 'Maine' },
  '049': { areaCode: '207', state: 'ME', region: 'Maine' },
  '050': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '051': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '052': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '053': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '054': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '056': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '057': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '058': { areaCode: '802', state: 'VT', region: 'Vermont' },
  '059': { areaCode: '802', state: 'VT', region: 'Vermont' },

  // New York (10x-14x)
  '100': { areaCode: '212', state: 'NY', region: 'New York City' },
  '101': { areaCode: '212', state: 'NY', region: 'New York City' },
  '102': { areaCode: '212', state: 'NY', region: 'New York City' },
  '103': { areaCode: '212', state: 'NY', region: 'New York City' },
  '104': { areaCode: '914', state: 'NY', region: 'Westchester' },
  '105': { areaCode: '914', state: 'NY', region: 'Westchester' },
  '106': { areaCode: '914', state: 'NY', region: 'Westchester' },
  '107': { areaCode: '914', state: 'NY', region: 'Westchester' },
  '108': { areaCode: '914', state: 'NY', region: 'Westchester' },
  '109': { areaCode: '914', state: 'NY', region: 'Westchester' },
  '110': { areaCode: '718', state: 'NY', region: 'Queens' },
  '111': { areaCode: '718', state: 'NY', region: 'Queens' },
  '112': { areaCode: '718', state: 'NY', region: 'Brooklyn' },
  '113': { areaCode: '718', state: 'NY', region: 'Queens' },
  '114': { areaCode: '718', state: 'NY', region: 'Queens' },
  '115': { areaCode: '718', state: 'NY', region: 'Queens' },
  '116': { areaCode: '718', state: 'NY', region: 'Queens' },
  '117': { areaCode: '516', state: 'NY', region: 'Long Island' },
  '118': { areaCode: '516', state: 'NY', region: 'Long Island' },
  '119': { areaCode: '516', state: 'NY', region: 'Long Island' },
  '120': { areaCode: '518', state: 'NY', region: 'Albany' },
  '121': { areaCode: '518', state: 'NY', region: 'Albany' },
  '122': { areaCode: '518', state: 'NY', region: 'Albany' },
  '123': { areaCode: '518', state: 'NY', region: 'Albany' },
  '124': { areaCode: '518', state: 'NY', region: 'Albany' },
  '125': { areaCode: '518', state: 'NY', region: 'Albany' },
  '126': { areaCode: '607', state: 'NY', region: 'Binghamton' },
  '127': { areaCode: '607', state: 'NY', region: 'Binghamton' },
  '128': { areaCode: '585', state: 'NY', region: 'Rochester' },
  '129': { areaCode: '585', state: 'NY', region: 'Rochester' },
  '130': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '131': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '132': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '133': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '134': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '135': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '136': { areaCode: '607', state: 'NY', region: 'Binghamton' },
  '137': { areaCode: '607', state: 'NY', region: 'Binghamton' },
  '138': { areaCode: '607', state: 'NY', region: 'Binghamton' },
  '139': { areaCode: '607', state: 'NY', region: 'Binghamton' },
  '140': { areaCode: '716', state: 'NY', region: 'Buffalo' },
  '141': { areaCode: '716', state: 'NY', region: 'Buffalo' },
  '142': { areaCode: '716', state: 'NY', region: 'Buffalo' },
  '143': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '144': { areaCode: '315', state: 'NY', region: 'Syracuse' },
  '145': { areaCode: '716', state: 'NY', region: 'Buffalo' },
  '146': { areaCode: '716', state: 'NY', region: 'Buffalo' },
  '147': { areaCode: '716', state: 'NY', region: 'Buffalo' },
  '148': { areaCode: '716', state: 'NY', region: 'Buffalo' },
  '149': { areaCode: '716', state: 'NY', region: 'Buffalo' },

  // Pennsylvania (15x-19x)
  '150': { areaCode: '412', state: 'PA', region: 'Pittsburgh' },
  '151': { areaCode: '412', state: 'PA', region: 'Pittsburgh' },
  '152': { areaCode: '412', state: 'PA', region: 'Pittsburgh' },
  '153': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '154': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '155': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '156': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '157': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '158': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '159': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '160': { areaCode: '724', state: 'PA', region: 'Western PA' },
  '161': { areaCode: '215', state: 'PA', region: 'Philadelphia' },
  '162': { areaCode: '814', state: 'PA', region: 'Erie' },
  '163': { areaCode: '814', state: 'PA', region: 'Erie' },
  '164': { areaCode: '814', state: 'PA', region: 'Erie' },
  '165': { areaCode: '814', state: 'PA', region: 'Erie' },
  '166': { areaCode: '814', state: 'PA', region: 'Erie' },
  '167': { areaCode: '814', state: 'PA', region: 'Erie' },
  '168': { areaCode: '610', state: 'PA', region: 'Allentown' },
  '169': { areaCode: '610', state: 'PA', region: 'Reading' },
  '170': { areaCode: '717', state: 'PA', region: 'Harrisburg' },
  '171': { areaCode: '717', state: 'PA', region: 'Harrisburg' },
  '172': { areaCode: '717', state: 'PA', region: 'Harrisburg' },
  '173': { areaCode: '717', state: 'PA', region: 'York' },
  '174': { areaCode: '717', state: 'PA', region: 'York' },
  '175': { areaCode: '717', state: 'PA', region: 'Lancaster' },
  '176': { areaCode: '717', state: 'PA', region: 'Lancaster' },
  '177': { areaCode: '717', state: 'PA', region: 'Williamsport' },
  '178': { areaCode: '610', state: 'PA', region: 'Allentown' },
  '179': { areaCode: '610', state: 'PA', region: 'Pottsville' },
  '180': { areaCode: '570', state: 'PA', region: 'Scranton' },
  '181': { areaCode: '570', state: 'PA', region: 'Scranton' },
  '182': { areaCode: '570', state: 'PA', region: 'Wilkes-Barre' },
  '183': { areaCode: '717', state: 'PA', region: 'Harrisburg' },
  '184': { areaCode: '570', state: 'PA', region: 'Scranton' },
  '185': { areaCode: '570', state: 'PA', region: 'Scranton' },
  '186': { areaCode: '570', state: 'PA', region: 'Wilkes-Barre' },
  '187': { areaCode: '570', state: 'PA', region: 'Wilkes-Barre' },
  '188': { areaCode: '570', state: 'PA', region: 'Scranton' },
  '189': { areaCode: '570', state: 'PA', region: 'Scranton' },
  '190': { areaCode: '215', state: 'PA', region: 'Philadelphia' },
  '191': { areaCode: '215', state: 'PA', region: 'Philadelphia' },
  '192': { areaCode: '610', state: 'PA', region: 'Chester' },
  '193': { areaCode: '610', state: 'PA', region: 'Philadelphia Suburbs' },
  '194': { areaCode: '610', state: 'PA', region: 'Norristown' },
  '195': { areaCode: '610', state: 'PA', region: 'Reading' },
  '196': { areaCode: '610', state: 'PA', region: 'West Chester' },

  // Mid-Atlantic (20x-24x)
  '200': { areaCode: '202', state: 'DC', region: 'Washington DC' },
  '201': { areaCode: '703', state: 'VA', region: 'Northern Virginia' },
  '202': { areaCode: '202', state: 'DC', region: 'Washington DC' },
  '203': { areaCode: '202', state: 'DC', region: 'Washington DC' },
  '204': { areaCode: '202', state: 'DC', region: 'Washington DC' },
  '205': { areaCode: '202', state: 'DC', region: 'Washington DC' },
  '206': { areaCode: '301', state: 'MD', region: 'Southern Maryland' },
  '207': { areaCode: '301', state: 'MD', region: 'Southern Maryland' },
  '208': { areaCode: '301', state: 'MD', region: 'Southern Maryland' },
  '209': { areaCode: '301', state: 'MD', region: 'Southern Maryland' },
  '210': { areaCode: '410', state: 'MD', region: 'Baltimore' },
  '211': { areaCode: '410', state: 'MD', region: 'Baltimore' },
  '212': { areaCode: '410', state: 'MD', region: 'Baltimore' },
  '214': { areaCode: '410', state: 'MD', region: 'Baltimore' },
  '215': { areaCode: '410', state: 'MD', region: 'Baltimore' },
  '216': { areaCode: '410', state: 'MD', region: 'Baltimore' },
  '217': { areaCode: '410', state: 'MD', region: 'Baltimore' },
  '218': { areaCode: '301', state: 'MD', region: 'Maryland' },
  '219': { areaCode: '410', state: 'MD', region: 'Maryland' },
  '220': { areaCode: '703', state: 'VA', region: 'Northern Virginia' },
  '221': { areaCode: '703', state: 'VA', region: 'Northern Virginia' },
  '222': { areaCode: '703', state: 'VA', region: 'Arlington' },
  '223': { areaCode: '703', state: 'VA', region: 'Alexandria' },
  '224': { areaCode: '703', state: 'VA', region: 'Fredericksburg' },
  '225': { areaCode: '703', state: 'VA', region: 'Winchester' },
  '226': { areaCode: '703', state: 'VA', region: 'Winchester' },
  '227': { areaCode: '703', state: 'VA', region: 'Culpeper' },
  '228': { areaCode: '540', state: 'VA', region: 'Harrisonburg' },
  '229': { areaCode: '434', state: 'VA', region: 'Charlottesville' },
  '230': { areaCode: '804', state: 'VA', region: 'Richmond' },
  '231': { areaCode: '804', state: 'VA', region: 'Richmond' },
  '232': { areaCode: '804', state: 'VA', region: 'Richmond' },
  '233': { areaCode: '757', state: 'VA', region: 'Norfolk' },
  '234': { areaCode: '757', state: 'VA', region: 'Norfolk' },
  '235': { areaCode: '757', state: 'VA', region: 'Norfolk' },
  '236': { areaCode: '757', state: 'VA', region: 'Hampton' },
  '237': { areaCode: '757', state: 'VA', region: 'Portsmouth' },
  '238': { areaCode: '804', state: 'VA', region: 'Petersburg' },
  '239': { areaCode: '434', state: 'VA', region: 'Farmville' },
  '240': { areaCode: '540', state: 'VA', region: 'Roanoke' },
  '241': { areaCode: '540', state: 'VA', region: 'Roanoke' },
  '242': { areaCode: '540', state: 'VA', region: 'Bristol' },
  '243': { areaCode: '540', state: 'VA', region: 'Pulaski' },
  '244': { areaCode: '540', state: 'VA', region: 'Staunton' },
  '245': { areaCode: '434', state: 'VA', region: 'Lynchburg' },
  '246': { areaCode: '434', state: 'VA', region: 'Bluefield' },

  // Southeast (25x-31x)
  '250': { areaCode: '304', state: 'WV', region: 'Charleston' },
  '251': { areaCode: '304', state: 'WV', region: 'Charleston' },
  '252': { areaCode: '304', state: 'WV', region: 'Huntington' },
  '253': { areaCode: '304', state: 'WV', region: 'Charleston' },
  '254': { areaCode: '304', state: 'WV', region: 'Martinsburg' },
  '255': { areaCode: '304', state: 'WV', region: 'Huntington' },
  '256': { areaCode: '304', state: 'WV', region: 'Huntington' },
  '257': { areaCode: '304', state: 'WV', region: 'Charleston' },
  '258': { areaCode: '304', state: 'WV', region: 'Beckley' },
  '259': { areaCode: '304', state: 'WV', region: 'Bluefield' },
  '260': { areaCode: '304', state: 'WV', region: 'Wheeling' },
  '261': { areaCode: '304', state: 'WV', region: 'Parkersburg' },
  '262': { areaCode: '304', state: 'WV', region: 'Parkersburg' },
  '263': { areaCode: '304', state: 'WV', region: 'Clarksburg' },
  '264': { areaCode: '304', state: 'WV', region: 'Clarksburg' },
  '265': { areaCode: '304', state: 'WV', region: 'Clarksburg' },
  '266': { areaCode: '304', state: 'WV', region: 'Morgantown' },
  '267': { areaCode: '304', state: 'WV', region: 'Romney' },
  '268': { areaCode: '304', state: 'WV', region: 'Petersburg' },
  '270': { areaCode: '859', state: 'KY', region: 'Lexington' },
  '271': { areaCode: '502', state: 'KY', region: 'Louisville' },
  '272': { areaCode: '606', state: 'KY', region: 'Somerset' },
  '273': { areaCode: '606', state: 'KY', region: 'London' },
  '274': { areaCode: '270', state: 'KY', region: 'Paducah' },
  '275': { areaCode: '270', state: 'KY', region: 'Bowling Green' },
  '276': { areaCode: '270', state: 'KY', region: 'Elizabethtown' },
  '277': { areaCode: '270', state: 'KY', region: 'Owensboro' },
  '278': { areaCode: '606', state: 'KY', region: 'Pikeville' },
  '279': { areaCode: '606', state: 'KY', region: 'Hazard' },
  '280': { areaCode: '865', state: 'TN', region: 'Knoxville' },
  '281': { areaCode: '423', state: 'TN', region: 'Johnson City' },
  '282': { areaCode: '423', state: 'TN', region: 'Bristol' },
  '283': { areaCode: '423', state: 'TN', region: 'Johnson City' },
  '284': { areaCode: '423', state: 'TN', region: 'Kingsport' },
  '285': { areaCode: '423', state: 'TN', region: 'Chattanooga' },
  '286': { areaCode: '931', state: 'TN', region: 'Oak Ridge' },
  '287': { areaCode: '865', state: 'TN', region: 'Knoxville' },
  '288': { areaCode: '865', state: 'TN', region: 'Knoxville' },
  '289': { areaCode: '931', state: 'TN', region: 'Cookeville' },
  '290': { areaCode: '864', state: 'SC', region: 'Greenville' },
  '291': { areaCode: '864', state: 'SC', region: 'Spartanburg' },
  '292': { areaCode: '864', state: 'SC', region: 'Greenville' },
  '293': { areaCode: '864', state: 'SC', region: 'Greenville' },
  '294': { areaCode: '843', state: 'SC', region: 'Charleston' },
  '295': { areaCode: '843', state: 'SC', region: 'Florence' },
  '296': { areaCode: '864', state: 'SC', region: 'Rock Hill' },
  '297': { areaCode: '803', state: 'SC', region: 'Columbia' },
  '298': { areaCode: '843', state: 'SC', region: 'Aiken' },
  '299': { areaCode: '843', state: 'SC', region: 'Beaufort' },
  '300': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '301': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '302': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '303': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '304': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '305': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '306': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '307': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '308': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '309': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '310': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '311': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '312': { areaCode: '404', state: 'GA', region: 'Atlanta' },
  '313': { areaCode: '706', state: 'GA', region: 'Savannah' },
  '314': { areaCode: '706', state: 'GA', region: 'Savannah' },
  '315': { areaCode: '912', state: 'GA', region: 'Waycross' },
  '316': { areaCode: '912', state: 'GA', region: 'Valdosta' },
  '317': { areaCode: '706', state: 'GA', region: 'Albany' },
  '318': { areaCode: '706', state: 'GA', region: 'Columbus' },
  '319': { areaCode: '706', state: 'GA', region: 'Columbus' },

  // Florida (32x-34x)
  '320': { areaCode: '904', state: 'FL', region: 'Jacksonville' },
  '321': { areaCode: '904', state: 'FL', region: 'Jacksonville' },
  '322': { areaCode: '904', state: 'FL', region: 'Jacksonville' },
  '323': { areaCode: '850', state: 'FL', region: 'Tallahassee' },
  '324': { areaCode: '850', state: 'FL', region: 'Panama City' },
  '325': { areaCode: '850', state: 'FL', region: 'Pensacola' },
  '326': { areaCode: '352', state: 'FL', region: 'Gainesville' },
  '327': { areaCode: '352', state: 'FL', region: 'Ocala' },
  '328': { areaCode: '407', state: 'FL', region: 'Orlando' },
  '329': { areaCode: '407', state: 'FL', region: 'Orlando' },
  '330': { areaCode: '305', state: 'FL', region: 'Miami' },
  '331': { areaCode: '305', state: 'FL', region: 'Miami' },
  '332': { areaCode: '305', state: 'FL', region: 'Miami' },
  '333': { areaCode: '954', state: 'FL', region: 'Fort Lauderdale' },
  '334': { areaCode: '561', state: 'FL', region: 'West Palm Beach' },
  '335': { areaCode: '813', state: 'FL', region: 'Tampa' },
  '336': { areaCode: '813', state: 'FL', region: 'Tampa' },
  '337': { areaCode: '727', state: 'FL', region: 'St. Petersburg' },
  '338': { areaCode: '941', state: 'FL', region: 'Sarasota' },
  '339': { areaCode: '239', state: 'FL', region: 'Fort Myers' },
  '340': { areaCode: '321', state: 'FL', region: 'Melbourne' },
  '341': { areaCode: '239', state: 'FL', region: 'Fort Myers' },
  '342': { areaCode: '407', state: 'FL', region: 'Orlando' },
  '344': { areaCode: '386', state: 'FL', region: 'Daytona Beach' },
  '346': { areaCode: '386', state: 'FL', region: 'Daytona Beach' },
  '347': { areaCode: '407', state: 'FL', region: 'Orlando' },
  '349': { areaCode: '727', state: 'FL', region: 'Port Richey' },

  // Alabama (35x-36x)
  '350': { areaCode: '205', state: 'AL', region: 'Birmingham' },
  '351': { areaCode: '205', state: 'AL', region: 'Birmingham' },
  '352': { areaCode: '205', state: 'AL', region: 'Birmingham' },
  '354': { areaCode: '256', state: 'AL', region: 'Decatur' },
  '355': { areaCode: '205', state: 'AL', region: 'Tuscaloosa' },
  '356': { areaCode: '256', state: 'AL', region: 'Huntsville' },
  '357': { areaCode: '256', state: 'AL', region: 'Huntsville' },
  '358': { areaCode: '256', state: 'AL', region: 'Huntsville' },
  '359': { areaCode: '256', state: 'AL', region: 'Gadsden' },
  '360': { areaCode: '334', state: 'AL', region: 'Montgomery' },
  '361': { areaCode: '334', state: 'AL', region: 'Montgomery' },
  '362': { areaCode: '334', state: 'AL', region: 'Anniston' },
  '363': { areaCode: '334', state: 'AL', region: 'Dothan' },
  '364': { areaCode: '251', state: 'AL', region: 'Mobile' },
  '365': { areaCode: '251', state: 'AL', region: 'Mobile' },
  '366': { areaCode: '251', state: 'AL', region: 'Mobile' },
  '367': { areaCode: '334', state: 'AL', region: 'Selma' },
  '368': { areaCode: '334', state: 'AL', region: 'Opelika' },
  '369': { areaCode: '256', state: 'AL', region: 'Tuscumbia' },

  // Tennessee (37x-38x)
  '370': { areaCode: '615', state: 'TN', region: 'Nashville' },
  '371': { areaCode: '615', state: 'TN', region: 'Nashville' },
  '372': { areaCode: '615', state: 'TN', region: 'Nashville' },
  '373': { areaCode: '423', state: 'TN', region: 'Chattanooga' },
  '374': { areaCode: '423', state: 'TN', region: 'Chattanooga' },
  '375': { areaCode: '865', state: 'TN', region: 'Knoxville' },
  '376': { areaCode: '423', state: 'TN', region: 'Johnson City' },
  '377': { areaCode: '865', state: 'TN', region: 'Knoxville' },
  '378': { areaCode: '423', state: 'TN', region: 'Chattanooga' },
  '379': { areaCode: '865', state: 'TN', region: 'Knoxville' },
  '380': { areaCode: '901', state: 'TN', region: 'Memphis' },
  '381': { areaCode: '901', state: 'TN', region: 'Memphis' },
  '382': { areaCode: '901', state: 'TN', region: 'Memphis' },
  '383': { areaCode: '731', state: 'TN', region: 'Jackson' },
  '384': { areaCode: '731', state: 'TN', region: 'Jackson' },
  '385': { areaCode: '931', state: 'TN', region: 'Cookeville' },

  // Mississippi (38x-39x)
  '386': { areaCode: '662', state: 'MS', region: 'Clarksdale' },
  '387': { areaCode: '662', state: 'MS', region: 'Greenville' },
  '388': { areaCode: '662', state: 'MS', region: 'Tupelo' },
  '389': { areaCode: '662', state: 'MS', region: 'Greenwood' },
  '390': { areaCode: '601', state: 'MS', region: 'Jackson' },
  '391': { areaCode: '601', state: 'MS', region: 'Jackson' },
  '392': { areaCode: '601', state: 'MS', region: 'Jackson' },
  '393': { areaCode: '228', state: 'MS', region: 'Meridian' },
  '394': { areaCode: '601', state: 'MS', region: 'Laurel' },
  '395': { areaCode: '228', state: 'MS', region: 'Biloxi' },
  '396': { areaCode: '601', state: 'MS', region: 'McComb' },
  '397': { areaCode: '228', state: 'MS', region: 'Columbus' },

  // Kentucky (40x-42x)
  '400': { areaCode: '502', state: 'KY', region: 'Louisville' },
  '401': { areaCode: '502', state: 'KY', region: 'Louisville' },
  '402': { areaCode: '502', state: 'KY', region: 'Louisville' },
  '403': { areaCode: '859', state: 'KY', region: 'Lexington' },
  '404': { areaCode: '859', state: 'KY', region: 'Lexington' },
  '405': { areaCode: '859', state: 'KY', region: 'Lexington' },
  '406': { areaCode: '606', state: 'KY', region: 'Ashland' },
  '407': { areaCode: '270', state: 'KY', region: 'Elizabethtown' },
  '408': { areaCode: '270', state: 'KY', region: 'Bowling Green' },
  '409': { areaCode: '270', state: 'KY', region: 'Bowling Green' },
  '410': { areaCode: '606', state: 'KY', region: 'Somerset' },
  '411': { areaCode: '606', state: 'KY', region: 'Ashland' },
  '412': { areaCode: '270', state: 'KY', region: 'Owensboro' },
  '413': { areaCode: '606', state: 'KY', region: 'Pikeville' },
  '414': { areaCode: '606', state: 'KY', region: 'Hazard' },
  '415': { areaCode: '606', state: 'KY', region: 'Pikeville' },
  '416': { areaCode: '606', state: 'KY', region: 'Ashland' },
  '417': { areaCode: '606', state: 'KY', region: 'Hazard' },
  '418': { areaCode: '606', state: 'KY', region: 'Hazard' },
  '420': { areaCode: '270', state: 'KY', region: 'Paducah' },
  '421': { areaCode: '270', state: 'KY', region: 'Paducah' },
  '422': { areaCode: '270', state: 'KY', region: 'Paducah' },
  '423': { areaCode: '270', state: 'KY', region: 'Owensboro' },
  '424': { areaCode: '270', state: 'KY', region: 'Henderson' },
  '425': { areaCode: '859', state: 'KY', region: 'Lexington' },
  '426': { areaCode: '859', state: 'KY', region: 'Lexington' },
  '427': { areaCode: '270', state: 'KY', region: 'Elizabethtown' },

  // Ohio (43x-45x)
  '430': { areaCode: '614', state: 'OH', region: 'Columbus' },
  '431': { areaCode: '614', state: 'OH', region: 'Columbus' },
  '432': { areaCode: '614', state: 'OH', region: 'Columbus' },
  '433': { areaCode: '614', state: 'OH', region: 'Columbus' },
  '434': { areaCode: '419', state: 'OH', region: 'Toledo' },
  '435': { areaCode: '419', state: 'OH', region: 'Toledo' },
  '436': { areaCode: '419', state: 'OH', region: 'Toledo' },
  '437': { areaCode: '740', state: 'OH', region: 'Zanesville' },
  '438': { areaCode: '740', state: 'OH', region: 'Athens' },
  '439': { areaCode: '740', state: 'OH', region: 'Steubenville' },
  '440': { areaCode: '216', state: 'OH', region: 'Cleveland' },
  '441': { areaCode: '216', state: 'OH', region: 'Cleveland' },
  '442': { areaCode: '330', state: 'OH', region: 'Akron' },
  '443': { areaCode: '330', state: 'OH', region: 'Youngstown' },
  '444': { areaCode: '330', state: 'OH', region: 'Youngstown' },
  '445': { areaCode: '330', state: 'OH', region: 'Youngstown' },
  '446': { areaCode: '330', state: 'OH', region: 'Canton' },
  '447': { areaCode: '330', state: 'OH', region: 'Canton' },
  '448': { areaCode: '234', state: 'OH', region: 'Mansfield' },
  '449': { areaCode: '234', state: 'OH', region: 'Mansfield' },
  '450': { areaCode: '513', state: 'OH', region: 'Cincinnati' },
  '451': { areaCode: '513', state: 'OH', region: 'Cincinnati' },
  '452': { areaCode: '513', state: 'OH', region: 'Cincinnati' },
  '453': { areaCode: '937', state: 'OH', region: 'Dayton' },
  '454': { areaCode: '937', state: 'OH', region: 'Dayton' },
  '455': { areaCode: '937', state: 'OH', region: 'Springfield' },
  '456': { areaCode: '740', state: 'OH', region: 'Chillicothe' },
  '457': { areaCode: '740', state: 'OH', region: 'Athens' },
  '458': { areaCode: '937', state: 'OH', region: 'Lima' },

  // Indiana (46x-47x)
  '460': { areaCode: '317', state: 'IN', region: 'Indianapolis' },
  '461': { areaCode: '317', state: 'IN', region: 'Indianapolis' },
  '462': { areaCode: '317', state: 'IN', region: 'Indianapolis' },
  '463': { areaCode: '812', state: 'IN', region: 'Gary' },
  '464': { areaCode: '219', state: 'IN', region: 'Gary' },
  '465': { areaCode: '574', state: 'IN', region: 'South Bend' },
  '466': { areaCode: '574', state: 'IN', region: 'South Bend' },
  '467': { areaCode: '260', state: 'IN', region: 'Fort Wayne' },
  '468': { areaCode: '260', state: 'IN', region: 'Fort Wayne' },
  '469': { areaCode: '260', state: 'IN', region: 'Kokomo' },
  '470': { areaCode: '812', state: 'IN', region: 'Terre Haute' },
  '471': { areaCode: '812', state: 'IN', region: 'Terre Haute' },
  '472': { areaCode: '812', state: 'IN', region: 'Columbus' },
  '473': { areaCode: '812', state: 'IN', region: 'Muncie' },
  '474': { areaCode: '812', state: 'IN', region: 'Bloomington' },
  '475': { areaCode: '812', state: 'IN', region: 'Washington' },
  '476': { areaCode: '812', state: 'IN', region: 'Evansville' },
  '477': { areaCode: '812', state: 'IN', region: 'Evansville' },
  '478': { areaCode: '765', state: 'IN', region: 'Terre Haute' },
  '479': { areaCode: '812', state: 'IN', region: 'Lafayette' },

  // Michigan (48x-49x)
  '480': { areaCode: '313', state: 'MI', region: 'Detroit' },
  '481': { areaCode: '313', state: 'MI', region: 'Detroit' },
  '482': { areaCode: '313', state: 'MI', region: 'Detroit' },
  '483': { areaCode: '248', state: 'MI', region: 'Royal Oak' },
  '484': { areaCode: '810', state: 'MI', region: 'Flint' },
  '485': { areaCode: '810', state: 'MI', region: 'Flint' },
  '486': { areaCode: '989', state: 'MI', region: 'Saginaw' },
  '487': { areaCode: '517', state: 'MI', region: 'Lansing' },
  '488': { areaCode: '517', state: 'MI', region: 'Lansing' },
  '489': { areaCode: '517', state: 'MI', region: 'Lansing' },
  '490': { areaCode: '269', state: 'MI', region: 'Kalamazoo' },
  '491': { areaCode: '269', state: 'MI', region: 'Kalamazoo' },
  '492': { areaCode: '517', state: 'MI', region: 'Jackson' },
  '493': { areaCode: '616', state: 'MI', region: 'Grand Rapids' },
  '494': { areaCode: '269', state: 'MI', region: 'Battle Creek' },
  '495': { areaCode: '616', state: 'MI', region: 'Grand Rapids' },
  '496': { areaCode: '616', state: 'MI', region: 'Traverse City' },
  '497': { areaCode: '231', state: 'MI', region: 'Gaylord' },
  '498': { areaCode: '906', state: 'MI', region: 'Iron Mountain' },
  '499': { areaCode: '906', state: 'MI', region: 'Iron Mountain' },

  // Iowa (50x-52x)
  '500': { areaCode: '515', state: 'IA', region: 'Des Moines' },
  '501': { areaCode: '515', state: 'IA', region: 'Des Moines' },
  '502': { areaCode: '515', state: 'IA', region: 'Des Moines' },
  '503': { areaCode: '515', state: 'IA', region: 'Des Moines' },
  '504': { areaCode: '712', state: 'IA', region: 'Mason City' },
  '505': { areaCode: '563', state: 'IA', region: 'Fort Dodge' },
  '506': { areaCode: '319', state: 'IA', region: 'Waterloo' },
  '507': { areaCode: '319', state: 'IA', region: 'Waterloo' },
  '508': { areaCode: '563', state: 'IA', region: 'Creston' },
  '509': { areaCode: '515', state: 'IA', region: 'Des Moines' },
  '510': { areaCode: '712', state: 'IA', region: 'Sioux City' },
  '511': { areaCode: '712', state: 'IA', region: 'Sioux City' },
  '512': { areaCode: '712', state: 'IA', region: 'Sioux City' },
  '513': { areaCode: '712', state: 'IA', region: 'Spencer' },
  '514': { areaCode: '712', state: 'IA', region: 'Carroll' },
  '515': { areaCode: '712', state: 'IA', region: 'Council Bluffs' },
  '516': { areaCode: '712', state: 'IA', region: 'Shenandoah' },
  '520': { areaCode: '563', state: 'IA', region: 'Dubuque' },
  '521': { areaCode: '563', state: 'IA', region: 'Decorah' },
  '522': { areaCode: '319', state: 'IA', region: 'Cedar Rapids' },
  '523': { areaCode: '319', state: 'IA', region: 'Cedar Rapids' },
  '524': { areaCode: '319', state: 'IA', region: 'Cedar Rapids' },
  '525': { areaCode: '563', state: 'IA', region: 'Ottumwa' },
  '526': { areaCode: '319', state: 'IA', region: 'Burlington' },
  '527': { areaCode: '319', state: 'IA', region: 'Davenport' },
  '528': { areaCode: '319', state: 'IA', region: 'Davenport' },

  // Wisconsin (53x-54x)
  '530': { areaCode: '414', state: 'WI', region: 'Milwaukee' },
  '531': { areaCode: '414', state: 'WI', region: 'Milwaukee' },
  '532': { areaCode: '414', state: 'WI', region: 'Milwaukee' },
  '534': { areaCode: '262', state: 'WI', region: 'Racine' },
  '535': { areaCode: '608', state: 'WI', region: 'Madison' },
  '537': { areaCode: '608', state: 'WI', region: 'Madison' },
  '538': { areaCode: '608', state: 'WI', region: 'Lancaster' },
  '539': { areaCode: '608', state: 'WI', region: 'Portage' },
  '540': { areaCode: '715', state: 'WI', region: 'Eau Claire' },
  '541': { areaCode: '920', state: 'WI', region: 'Green Bay' },
  '542': { areaCode: '920', state: 'WI', region: 'Green Bay' },
  '543': { areaCode: '920', state: 'WI', region: 'Green Bay' },
  '544': { areaCode: '715', state: 'WI', region: 'Wausau' },
  '545': { areaCode: '715', state: 'WI', region: 'Rhinelander' },
  '546': { areaCode: '608', state: 'WI', region: 'La Crosse' },
  '547': { areaCode: '715', state: 'WI', region: 'Eau Claire' },
  '548': { areaCode: '715', state: 'WI', region: 'Eau Claire' },
  '549': { areaCode: '920', state: 'WI', region: 'Oshkosh' },

  // Minnesota (55x-56x)
  '550': { areaCode: '651', state: 'MN', region: 'St. Paul' },
  '551': { areaCode: '651', state: 'MN', region: 'St. Paul' },
  '553': { areaCode: '612', state: 'MN', region: 'Minneapolis' },
  '554': { areaCode: '612', state: 'MN', region: 'Minneapolis' },
  '555': { areaCode: '612', state: 'MN', region: 'Minneapolis' },
  '556': { areaCode: '218', state: 'MN', region: 'Duluth' },
  '557': { areaCode: '218', state: 'MN', region: 'Duluth' },
  '558': { areaCode: '218', state: 'MN', region: 'Duluth' },
  '559': { areaCode: '507', state: 'MN', region: 'Rochester' },
  '560': { areaCode: '507', state: 'MN', region: 'Mankato' },
  '561': { areaCode: '218', state: 'MN', region: 'Windom' },
  '562': { areaCode: '320', state: 'MN', region: 'Willmar' },
  '563': { areaCode: '320', state: 'MN', region: 'St. Cloud' },
  '564': { areaCode: '218', state: 'MN', region: 'Brainerd' },
  '565': { areaCode: '218', state: 'MN', region: 'Detroit Lakes' },
  '566': { areaCode: '218', state: 'MN', region: 'Bemidji' },
  '567': { areaCode: '218', state: 'MN', region: 'Thief River Falls' },

  // Illinois (60x-62x)
  '600': { areaCode: '312', state: 'IL', region: 'Chicago' },
  '601': { areaCode: '312', state: 'IL', region: 'Chicago' },
  '602': { areaCode: '312', state: 'IL', region: 'Evanston' },
  '603': { areaCode: '312', state: 'IL', region: 'Oak Park' },
  '604': { areaCode: '312', state: 'IL', region: 'Joliet' },
  '605': { areaCode: '312', state: 'IL', region: 'Chicago' },
  '606': { areaCode: '312', state: 'IL', region: 'Chicago' },
  '607': { areaCode: '312', state: 'IL', region: 'Chicago' },
  '608': { areaCode: '847', state: 'IL', region: 'Waukegan' },
  '609': { areaCode: '815', state: 'IL', region: 'Kankakee' },
  '610': { areaCode: '815', state: 'IL', region: 'Rockford' },
  '611': { areaCode: '815', state: 'IL', region: 'Rockford' },
  '612': { areaCode: '815', state: 'IL', region: 'Rock Island' },
  '613': { areaCode: '309', state: 'IL', region: 'La Salle' },
  '614': { areaCode: '309', state: 'IL', region: 'Galesburg' },
  '615': { areaCode: '309', state: 'IL', region: 'Peoria' },
  '616': { areaCode: '309', state: 'IL', region: 'Peoria' },
  '617': { areaCode: '309', state: 'IL', region: 'Bloomington' },
  '618': { areaCode: '309', state: 'IL', region: 'Champaign' },
  '619': { areaCode: '217', state: 'IL', region: 'Champaign' },
  '620': { areaCode: '618', state: 'IL', region: 'East St. Louis' },
  '621': { areaCode: '618', state: 'IL', region: 'Centralia' },
  '622': { areaCode: '618', state: 'IL', region: 'Cairo' },
  '623': { areaCode: '217', state: 'IL', region: 'Quincy' },
  '624': { areaCode: '217', state: 'IL', region: 'Effingham' },
  '625': { areaCode: '217', state: 'IL', region: 'Springfield' },
  '626': { areaCode: '217', state: 'IL', region: 'Springfield' },
  '627': { areaCode: '217', state: 'IL', region: 'Springfield' },
  '628': { areaCode: '618', state: 'IL', region: 'Centralia' },
  '629': { areaCode: '618', state: 'IL', region: 'Carbondale' },

  // Missouri (63x-65x)
  '630': { areaCode: '314', state: 'MO', region: 'St. Louis' },
  '631': { areaCode: '314', state: 'MO', region: 'St. Louis' },
  '633': { areaCode: '636', state: 'MO', region: 'St. Charles' },
  '634': { areaCode: '636', state: 'MO', region: 'Hannibal' },
  '635': { areaCode: '573', state: 'MO', region: 'Kirksville' },
  '636': { areaCode: '660', state: 'MO', region: 'Chillicothe' },
  '637': { areaCode: '573', state: 'MO', region: 'Cape Girardeau' },
  '638': { areaCode: '573', state: 'MO', region: 'Sikeston' },
  '639': { areaCode: '417', state: 'MO', region: 'Poplar Bluff' },
  '640': { areaCode: '816', state: 'MO', region: 'Kansas City' },
  '641': { areaCode: '816', state: 'MO', region: 'Kansas City' },
  '644': { areaCode: '816', state: 'MO', region: 'St. Joseph' },
  '645': { areaCode: '816', state: 'MO', region: 'St. Joseph' },
  '646': { areaCode: '660', state: 'MO', region: 'Chillicothe' },
  '647': { areaCode: '816', state: 'MO', region: 'Harrisonville' },
  '648': { areaCode: '417', state: 'MO', region: 'Joplin' },
  '649': { areaCode: '417', state: 'MO', region: 'Joplin' },
  '650': { areaCode: '573', state: 'MO', region: 'Jefferson City' },
  '651': { areaCode: '573', state: 'MO', region: 'Jefferson City' },
  '652': { areaCode: '573', state: 'MO', region: 'Columbia' },
  '653': { areaCode: '660', state: 'MO', region: 'Sedalia' },
  '654': { areaCode: '573', state: 'MO', region: 'Rolla' },
  '655': { areaCode: '417', state: 'MO', region: 'Rolla' },
  '656': { areaCode: '417', state: 'MO', region: 'Springfield' },
  '657': { areaCode: '417', state: 'MO', region: 'Springfield' },
  '658': { areaCode: '417', state: 'MO', region: 'Springfield' },

  // Kansas (66x-67x)
  '660': { areaCode: '913', state: 'KS', region: 'Kansas City' },
  '661': { areaCode: '913', state: 'KS', region: 'Kansas City' },
  '662': { areaCode: '913', state: 'KS', region: 'Shawnee Mission' },
  '664': { areaCode: '785', state: 'KS', region: 'Topeka' },
  '665': { areaCode: '785', state: 'KS', region: 'Topeka' },
  '666': { areaCode: '785', state: 'KS', region: 'Topeka' },
  '667': { areaCode: '316', state: 'KS', region: 'Ft. Scott' },
  '668': { areaCode: '620', state: 'KS', region: 'Emporia' },
  '669': { areaCode: '785', state: 'KS', region: 'Belleville' },
  '670': { areaCode: '316', state: 'KS', region: 'Wichita' },
  '671': { areaCode: '316', state: 'KS', region: 'Wichita' },
  '672': { areaCode: '316', state: 'KS', region: 'Wichita' },
  '673': { areaCode: '620', state: 'KS', region: 'Independence' },
  '674': { areaCode: '785', state: 'KS', region: 'Salina' },
  '675': { areaCode: '620', state: 'KS', region: 'Hutchinson' },
  '676': { areaCode: '785', state: 'KS', region: 'Hays' },
  '677': { areaCode: '620', state: 'KS', region: 'Dodge City' },
  '678': { areaCode: '620', state: 'KS', region: 'Dodge City' },
  '679': { areaCode: '785', state: 'KS', region: 'Colby' },

  // Nebraska (68x-69x)
  '680': { areaCode: '402', state: 'NE', region: 'Omaha' },
  '681': { areaCode: '402', state: 'NE', region: 'Omaha' },
  '683': { areaCode: '402', state: 'NE', region: 'Lincoln' },
  '684': { areaCode: '402', state: 'NE', region: 'Lincoln' },
  '685': { areaCode: '402', state: 'NE', region: 'Lincoln' },
  '686': { areaCode: '308', state: 'NE', region: 'Columbus' },
  '687': { areaCode: '308', state: 'NE', region: 'Norfolk' },
  '688': { areaCode: '308', state: 'NE', region: 'Grand Island' },
  '689': { areaCode: '308', state: 'NE', region: 'Hastings' },
  '690': { areaCode: '308', state: 'NE', region: 'McCook' },
  '691': { areaCode: '308', state: 'NE', region: 'North Platte' },
  '692': { areaCode: '308', state: 'NE', region: 'Valentine' },
  '693': { areaCode: '308', state: 'NE', region: 'Alliance' },

  // Louisiana (700-714)
  '700': { areaCode: '504', state: 'LA', region: 'New Orleans' },
  '701': { areaCode: '504', state: 'LA', region: 'New Orleans' },
  '703': { areaCode: '985', state: 'LA', region: 'Thibodaux' },
  '704': { areaCode: '985', state: 'LA', region: 'Hammond' },
  '705': { areaCode: '318', state: 'LA', region: 'Lafayette' },
  '706': { areaCode: '337', state: 'LA', region: 'Lake Charles' },
  '707': { areaCode: '337', state: 'LA', region: 'Baton Rouge' },
  '708': { areaCode: '225', state: 'LA', region: 'Baton Rouge' },
  '710': { areaCode: '318', state: 'LA', region: 'Shreveport' },
  '711': { areaCode: '318', state: 'LA', region: 'Shreveport' },
  '712': { areaCode: '318', state: 'LA', region: 'Monroe' },
  '713': { areaCode: '318', state: 'LA', region: 'Alexandria' },
  '714': { areaCode: '337', state: 'LA', region: 'Lake Charles' },

  // Arkansas (71x-72x)
  '716': { areaCode: '870', state: 'AR', region: 'Pine Bluff' },
  '717': { areaCode: '870', state: 'AR', region: 'Camden' },
  '718': { areaCode: '870', state: 'AR', region: 'Texarkana' },
  '719': { areaCode: '479', state: 'AR', region: 'Hot Springs' },
  '720': { areaCode: '501', state: 'AR', region: 'Little Rock' },
  '721': { areaCode: '501', state: 'AR', region: 'Little Rock' },
  '722': { areaCode: '501', state: 'AR', region: 'Little Rock' },
  '723': { areaCode: '870', state: 'AR', region: 'Pine Bluff' },
  '724': { areaCode: '870', state: 'AR', region: 'Jonesboro' },
  '725': { areaCode: '870', state: 'AR', region: 'Batesville' },
  '726': { areaCode: '479', state: 'AR', region: 'Harrison' },
  '727': { areaCode: '479', state: 'AR', region: 'Fayetteville' },
  '728': { areaCode: '479', state: 'AR', region: 'Russellville' },
  '729': { areaCode: '479', state: 'AR', region: 'Fort Smith' },

  // Oklahoma (73x-74x)
  '730': { areaCode: '405', state: 'OK', region: 'Oklahoma City' },
  '731': { areaCode: '405', state: 'OK', region: 'Oklahoma City' },
  '733': { areaCode: '580', state: 'OK', region: 'Stillwater' },
  '734': { areaCode: '580', state: 'OK', region: 'Ardmore' },
  '735': { areaCode: '580', state: 'OK', region: 'Lawton' },
  '736': { areaCode: '580', state: 'OK', region: 'Clinton' },
  '737': { areaCode: '580', state: 'OK', region: 'Enid' },
  '738': { areaCode: '580', state: 'OK', region: 'Woodward' },
  '739': { areaCode: '580', state: 'OK', region: 'Guymon' },
  '740': { areaCode: '918', state: 'OK', region: 'Tulsa' },
  '741': { areaCode: '918', state: 'OK', region: 'Tulsa' },
  '743': { areaCode: '918', state: 'OK', region: 'Miami' },
  '744': { areaCode: '918', state: 'OK', region: 'Muskogee' },
  '745': { areaCode: '918', state: 'OK', region: 'McAlester' },
  '746': { areaCode: '918', state: 'OK', region: 'Ponca City' },
  '747': { areaCode: '918', state: 'OK', region: 'Durant' },
  '748': { areaCode: '918', state: 'OK', region: 'Shawnee' },
  '749': { areaCode: '918', state: 'OK', region: 'Poteau' },

  // Texas (75x-79x)
  '750': { areaCode: '214', state: 'TX', region: 'Dallas' },
  '751': { areaCode: '214', state: 'TX', region: 'Dallas' },
  '752': { areaCode: '214', state: 'TX', region: 'Dallas' },
  '753': { areaCode: '972', state: 'TX', region: 'McKinney' },
  '754': { areaCode: '972', state: 'TX', region: 'Greenville' },
  '755': { areaCode: '903', state: 'TX', region: 'Texarkana' },
  '756': { areaCode: '903', state: 'TX', region: 'Longview' },
  '757': { areaCode: '903', state: 'TX', region: 'Tyler' },
  '758': { areaCode: '903', state: 'TX', region: 'Palestine' },
  '759': { areaCode: '361', state: 'TX', region: 'Lufkin' },
  '760': { areaCode: '817', state: 'TX', region: 'Fort Worth' },
  '761': { areaCode: '817', state: 'TX', region: 'Fort Worth' },
  '762': { areaCode: '940', state: 'TX', region: 'Denton' },
  '763': { areaCode: '254', state: 'TX', region: 'Wichita Falls' },
  '764': { areaCode: '940', state: 'TX', region: 'Eastland' },
  '765': { areaCode: '254', state: 'TX', region: 'Temple' },
  '766': { areaCode: '254', state: 'TX', region: 'Waco' },
  '767': { areaCode: '254', state: 'TX', region: 'Waco' },
  '768': { areaCode: '512', state: 'TX', region: 'Brownwood' },
  '769': { areaCode: '325', state: 'TX', region: 'San Angelo' },
  '770': { areaCode: '713', state: 'TX', region: 'Houston' },
  '771': { areaCode: '713', state: 'TX', region: 'Houston' },
  '772': { areaCode: '713', state: 'TX', region: 'Houston' },
  '773': { areaCode: '409', state: 'TX', region: 'Huntsville' },
  '774': { areaCode: '979', state: 'TX', region: 'Wharton' },
  '775': { areaCode: '409', state: 'TX', region: 'Galveston' },
  '776': { areaCode: '409', state: 'TX', region: 'Beaumont' },
  '777': { areaCode: '409', state: 'TX', region: 'Beaumont' },
  '778': { areaCode: '956', state: 'TX', region: 'Bryan' },
  '779': { areaCode: '361', state: 'TX', region: 'Victoria' },
  '780': { areaCode: '210', state: 'TX', region: 'San Antonio' },
  '781': { areaCode: '210', state: 'TX', region: 'San Antonio' },
  '782': { areaCode: '210', state: 'TX', region: 'San Antonio' },
  '783': { areaCode: '830', state: 'TX', region: 'Laredo' },
  '784': { areaCode: '956', state: 'TX', region: 'Laredo' },
  '785': { areaCode: '956', state: 'TX', region: 'McAllen' },
  '786': { areaCode: '512', state: 'TX', region: 'Austin' },
  '787': { areaCode: '512', state: 'TX', region: 'Austin' },
  '788': { areaCode: '830', state: 'TX', region: 'Del Rio' },
  '789': { areaCode: '361', state: 'TX', region: 'Corpus Christi' },
  '790': { areaCode: '325', state: 'TX', region: 'Abilene' },
  '791': { areaCode: '325', state: 'TX', region: 'Abilene' },
  '792': { areaCode: '325', state: 'TX', region: 'Childress' },
  '793': { areaCode: '806', state: 'TX', region: 'Lubbock' },
  '794': { areaCode: '806', state: 'TX', region: 'Lubbock' },
  '795': { areaCode: '432', state: 'TX', region: 'Abilene' },
  '796': { areaCode: '432', state: 'TX', region: 'Odessa' },
  '797': { areaCode: '432', state: 'TX', region: 'Midland' },
  '798': { areaCode: '915', state: 'TX', region: 'El Paso' },
  '799': { areaCode: '915', state: 'TX', region: 'El Paso' },

  // Colorado (80x-81x)
  '800': { areaCode: '303', state: 'CO', region: 'Denver' },
  '801': { areaCode: '303', state: 'CO', region: 'Denver' },
  '802': { areaCode: '303', state: 'CO', region: 'Denver' },
  '803': { areaCode: '303', state: 'CO', region: 'Boulder' },
  '804': { areaCode: '970', state: 'CO', region: 'Longmont' },
  '805': { areaCode: '970', state: 'CO', region: 'Fort Collins' },
  '806': { areaCode: '970', state: 'CO', region: 'Greeley' },
  '807': { areaCode: '970', state: 'CO', region: 'Fort Morgan' },
  '808': { areaCode: '719', state: 'CO', region: 'Colorado Springs' },
  '809': { areaCode: '719', state: 'CO', region: 'Colorado Springs' },
  '810': { areaCode: '719', state: 'CO', region: 'Pueblo' },
  '811': { areaCode: '719', state: 'CO', region: 'Alamosa' },
  '812': { areaCode: '970', state: 'CO', region: 'Salida' },
  '813': { areaCode: '970', state: 'CO', region: 'Durango' },
  '814': { areaCode: '970', state: 'CO', region: 'Montrose' },
  '815': { areaCode: '970', state: 'CO', region: 'Grand Junction' },
  '816': { areaCode: '970', state: 'CO', region: 'Glenwood Springs' },

  // Wyoming (82x-83x)
  '820': { areaCode: '307', state: 'WY', region: 'Cheyenne' },
  '821': { areaCode: '307', state: 'WY', region: 'Yellowstone National Park' },
  '822': { areaCode: '307', state: 'WY', region: 'Wheatland' },
  '823': { areaCode: '307', state: 'WY', region: 'Rawlins' },
  '824': { areaCode: '307', state: 'WY', region: 'Worland' },
  '825': { areaCode: '307', state: 'WY', region: 'Riverton' },
  '826': { areaCode: '307', state: 'WY', region: 'Casper' },
  '827': { areaCode: '307', state: 'WY', region: 'Newcastle' },
  '828': { areaCode: '307', state: 'WY', region: 'Sheridan' },
  '829': { areaCode: '307', state: 'WY', region: 'Rock Springs' },
  '830': { areaCode: '208', state: 'ID', region: 'Pocatello' },
  '831': { areaCode: '208', state: 'ID', region: 'Pocatello' },
  '832': { areaCode: '208', state: 'ID', region: 'Twin Falls' },
  '833': { areaCode: '208', state: 'ID', region: 'Twin Falls' },
  '834': { areaCode: '208', state: 'ID', region: 'Pocatello' },
  '835': { areaCode: '208', state: 'ID', region: 'Lewiston' },
  '836': { areaCode: '208', state: 'ID', region: 'Boise' },
  '837': { areaCode: '208', state: 'ID', region: 'Boise' },
  '838': { areaCode: '208', state: 'ID', region: 'Coeur d''Alene' },

  // Utah (84x-84x)
  '840': { areaCode: '801', state: 'UT', region: 'Salt Lake City' },
  '841': { areaCode: '801', state: 'UT', region: 'Salt Lake City' },
  '842': { areaCode: '435', state: 'UT', region: 'Ogden' },
  '843': { areaCode: '435', state: 'UT', region: 'Logan' },
  '844': { areaCode: '801', state: 'UT', region: 'Ogden' },
  '845': { areaCode: '435', state: 'UT', region: 'Provo' },
  '846': { areaCode: '435', state: 'UT', region: 'Provo' },
  '847': { areaCode: '435', state: 'UT', region: 'Price' },

  // Arizona (85x-86x)
  '850': { areaCode: '480', state: 'AZ', region: 'Phoenix' },
  '851': { areaCode: '623', state: 'AZ', region: 'Phoenix' },
  '852': { areaCode: '602', state: 'AZ', region: 'Phoenix' },
  '853': { areaCode: '602', state: 'AZ', region: 'Phoenix' },
  '855': { areaCode: '480', state: 'AZ', region: 'Scottsdale' },
  '856': { areaCode: '928', state: 'AZ', region: 'Tucson' },
  '857': { areaCode: '520', state: 'AZ', region: 'Tucson' },
  '859': { areaCode: '928', state: 'AZ', region: 'Show Low' },
  '860': { areaCode: '928', state: 'AZ', region: 'Flagstaff' },
  '863': { areaCode: '928', state: 'AZ', region: 'Prescott' },
  '864': { areaCode: '928', state: 'AZ', region: 'Kingman' },
  '865': { areaCode: '928', state: 'AZ', region: 'Yuma' },

  // New Mexico (87x-88x)
  '870': { areaCode: '505', state: 'NM', region: 'Albuquerque' },
  '871': { areaCode: '505', state: 'NM', region: 'Albuquerque' },
  '873': { areaCode: '575', state: 'NM', region: 'Gallup' },
  '874': { areaCode: '575', state: 'NM', region: 'Farmington' },
  '875': { areaCode: '505', state: 'NM', region: 'Santa Fe' },
  '877': { areaCode: '575', state: 'NM', region: 'Las Vegas' },
  '878': { areaCode: '575', state: 'NM', region: 'Socorro' },
  '879': { areaCode: '575', state: 'NM', region: 'Truth or Consequences' },
  '880': { areaCode: '915', state: 'TX', region: 'El Paso' },
  '881': { areaCode: '575', state: 'NM', region: 'Clovis' },
  '882': { areaCode: '575', state: 'NM', region: 'Roswell' },
  '883': { areaCode: '575', state: 'NM', region: 'Carlsbad' },
  '884': { areaCode: '575', state: 'NM', region: 'Tucumcari' },

  // Nevada (89x-89x)
  '889': { areaCode: '702', state: 'NV', region: 'Las Vegas' },
  '890': { areaCode: '702', state: 'NV', region: 'Las Vegas' },
  '891': { areaCode: '702', state: 'NV', region: 'Las Vegas' },
  '893': { areaCode: '775', state: 'NV', region: 'Ely' },
  '894': { areaCode: '775', state: 'NV', region: 'Las Vegas' },
  '895': { areaCode: '702', state: 'NV', region: 'Las Vegas' },
  '897': { areaCode: '775', state: 'NV', region: 'Carson City' },
  '898': { areaCode: '775', state: 'NV', region: 'Elko' },

  // California (90x-96x)
  '900': { areaCode: '213', state: 'CA', region: 'Los Angeles' },
  '901': { areaCode: '213', state: 'CA', region: 'Los Angeles' },
  '902': { areaCode: '323', state: 'CA', region: 'Inglewood' },
  '903': { areaCode: '310', state: 'CA', region: 'Inglewood' },
  '904': { areaCode: '310', state: 'CA', region: 'Santa Monica' },
  '905': { areaCode: '562', state: 'CA', region: 'Torrance' },
  '906': { areaCode: '562', state: 'CA', region: 'Long Beach' },
  '907': { areaCode: '562', state: 'CA', region: 'Long Beach' },
  '908': { areaCode: '562', state: 'CA', region: 'Long Beach' },
  '910': { areaCode: '626', state: 'CA', region: 'Pasadena' },
  '911': { areaCode: '626', state: 'CA', region: 'Pasadena' },
  '912': { areaCode: '818', state: 'CA', region: 'Glendale' },
  '913': { areaCode: '818', state: 'CA', region: 'Van Nuys' },
  '914': { areaCode: '818', state: 'CA', region: 'Van Nuys' },
  '915': { areaCode: '818', state: 'CA', region: 'Burbank' },
  '916': { areaCode: '661', state: 'CA', region: 'Canoga Park' },
  '917': { areaCode: '661', state: 'CA', region: 'Palmdale' },
  '918': { areaCode: '661', state: 'CA', region: 'Northridge' },
  '919': { areaCode: '805', state: 'CA', region: 'San Diego' },
  '920': { areaCode: '619', state: 'CA', region: 'San Diego' },
  '921': { areaCode: '619', state: 'CA', region: 'San Diego' },
  '922': { areaCode: '858', state: 'CA', region: 'San Diego' },
  '923': { areaCode: '760', state: 'CA', region: 'Imperial' },
  '924': { areaCode: '760', state: 'CA', region: 'San Bernardino' },
  '925': { areaCode: '951', state: 'CA', region: 'Riverside' },
  '926': { areaCode: '909', state: 'CA', region: 'Santa Ana' },
  '927': { areaCode: '714', state: 'CA', region: 'Santa Ana' },
  '928': { areaCode: '714', state: 'CA', region: 'Anaheim' },
  '930': { areaCode: '805', state: 'CA', region: 'Oxnard' },
  '931': { areaCode: '805', state: 'CA', region: 'Santa Barbara' },
  '932': { areaCode: '661', state: 'CA', region: 'Bakersfield' },
  '933': { areaCode: '661', state: 'CA', region: 'Bakersfield' },
  '934': { areaCode: '805', state: 'CA', region: 'San Luis Obispo' },
  '935': { areaCode: '559', state: 'CA', region: 'Mojave' },
  '936': { areaCode: '559', state: 'CA', region: 'Fresno' },
  '937': { areaCode: '559', state: 'CA', region: 'Fresno' },
  '938': { areaCode: '559', state: 'CA', region: 'Fresno' },
  '939': { areaCode: '209', state: 'CA', region: 'Salinas' },
  '940': { areaCode: '415', state: 'CA', region: 'San Francisco' },
  '941': { areaCode: '415', state: 'CA', region: 'San Francisco' },
  '942': { areaCode: '916', state: 'CA', region: 'Sacramento' },
  '943': { areaCode: '650', state: 'CA', region: 'Palo Alto' },
  '944': { areaCode: '650', state: 'CA', region: 'San Mateo' },
  '945': { areaCode: '510', state: 'CA', region: 'Oakland' },
  '946': { areaCode: '510', state: 'CA', region: 'Oakland' },
  '947': { areaCode: '510', state: 'CA', region: 'Berkeley' },
  '948': { areaCode: '925', state: 'CA', region: 'Richmond' },
  '949': { areaCode: '209', state: 'CA', region: 'San Rafael' },
  '950': { areaCode: '707', state: 'CA', region: 'Santa Rosa' },
  '951': { areaCode: '707', state: 'CA', region: 'San Rafael' },
  '952': { areaCode: '209', state: 'CA', region: 'Stockton' },
  '953': { areaCode: '209', state: 'CA', region: 'Stockton' },
  '954': { areaCode: '209', state: 'CA', region: 'Santa Rosa' },
  '955': { areaCode: '209', state: 'CA', region: 'Eureka' },
  '956': { areaCode: '916', state: 'CA', region: 'Sacramento' },
  '957': { areaCode: '916', state: 'CA', region: 'Sacramento' },
  '958': { areaCode: '916', state: 'CA', region: 'Sacramento' },
  '959': { areaCode: '209', state: 'CA', region: 'Modesto' },
  '960': { areaCode: '530', state: 'CA', region: 'Redding' },
  '961': { areaCode: '530', state: 'CA', region: 'Reno' },

  // Hawaii (967-968)
  '967': { areaCode: '808', state: 'HI', region: 'Hawaii' },
  '968': { areaCode: '808', state: 'HI', region: 'Hawaii' },

  // Oregon (97x)
  '970': { areaCode: '503', state: 'OR', region: 'Portland' },
  '971': { areaCode: '503', state: 'OR', region: 'Portland' },
  '972': { areaCode: '503', state: 'OR', region: 'Portland' },
  '973': { areaCode: '503', state: 'OR', region: 'Salem' },
  '974': { areaCode: '541', state: 'OR', region: 'Eugene' },
  '975': { areaCode: '541', state: 'OR', region: 'Medford' },
  '976': { areaCode: '541', state: 'OR', region: 'Klamath Falls' },
  '977': { areaCode: '541', state: 'OR', region: 'Bend' },
  '978': { areaCode: '541', state: 'OR', region: 'Pendleton' },
  '979': { areaCode: '541', state: 'OR', region: 'Vale' },

  // Washington (98x-99x)
  '980': { areaCode: '206', state: 'WA', region: 'Seattle' },
  '981': { areaCode: '206', state: 'WA', region: 'Seattle' },
  '982': { areaCode: '253', state: 'WA', region: 'Everett' },
  '983': { areaCode: '360', state: 'WA', region: 'Tacoma' },
  '984': { areaCode: '360', state: 'WA', region: 'Tacoma' },
  '985': { areaCode: '360', state: 'WA', region: 'Olympia' },
  '986': { areaCode: '360', state: 'WA', region: 'Vancouver' },
  '988': { areaCode: '360', state: 'WA', region: 'Wenatchee' },
  '989': { areaCode: '509', state: 'WA', region: 'Yakima' },
  '990': { areaCode: '509', state: 'WA', region: 'Spokane' },
  '991': { areaCode: '509', state: 'WA', region: 'Spokane' },
  '992': { areaCode: '509', state: 'WA', region: 'Spokane' },
  '993': { areaCode: '509', state: 'WA', region: 'Richland' },
  '994': { areaCode: '509', state: 'WA', region: 'Clarkston' },

  // Alaska (995-999)
  '995': { areaCode: '907', state: 'AK', region: 'Anchorage' },
  '996': { areaCode: '907', state: 'AK', region: 'Anchorage' },
  '997': { areaCode: '907', state: 'AK', region: 'Fairbanks' },
  '998': { areaCode: '907', state: 'AK', region: 'Juneau' },
  '999': { areaCode: '907', state: 'AK', region: 'Ketchikan' },
}

/**
 * Get area code for a given zip code using nationwide mapping
 */
export function getAreaCodeForZipCode(zipCode: string): string | null {
  // Extract first 3 digits of zip code
  const prefix = zipCode.substring(0, 3)
  const mapping = ZIP_PREFIX_TO_AREA_CODE[prefix]
  return mapping?.areaCode || null
}

/**
 * Get location info for a zip code
 */
export function getLocationForZipCode(zipCode: string): ZipCodeMapping | undefined {
  const prefix = zipCode.substring(0, 3)
  const mapping = ZIP_PREFIX_TO_AREA_CODE[prefix]

  if (!mapping) {
    return undefined
  }

  return {
    zipCode,
    areaCode: mapping.areaCode,
    city: mapping.region,
    state: mapping.state,
  }
}

/**
 * Get all supported zip codes
 */
export function getSupportedZipCodes(): string[] {
  // Returns all US zip code prefixes we support
  return Object.keys(ZIP_PREFIX_TO_AREA_CODE)
}

/**
 * Check if a zip code is supported
 */
export function isZipCodeSupported(zipCode: string): boolean {
  const prefix = zipCode.substring(0, 3)
  return ZIP_PREFIX_TO_AREA_CODE[prefix] !== undefined
}

/**
 * Get area codes for a specific state
 */
export function getAreaCodesForState(stateCode: string): string[] {
  const areaCodes = Object.values(ZIP_PREFIX_TO_AREA_CODE)
    .filter(m => m.state === stateCode)
    .map(m => m.areaCode)
  return [...new Set(areaCodes)]
}

/**
 * Mock phone number pool (in production, this would come from your SMS provider)
 */
const MOCK_PHONE_POOL: PhoneNumber[] = [
  // 404 numbers
  { id: '1', phoneNumber: '404-555-0101', areaCode: '404', isAvailable: true, createdAt: new Date() },
  { id: '2', phoneNumber: '404-555-0102', areaCode: '404', isAvailable: true, createdAt: new Date() },
  { id: '3', phoneNumber: '404-555-0103', areaCode: '404', isAvailable: true, createdAt: new Date() },

  // 470 numbers
  { id: '4', phoneNumber: '470-555-0101', areaCode: '470', isAvailable: true, createdAt: new Date() },
  { id: '5', phoneNumber: '470-555-0102', areaCode: '470', isAvailable: true, createdAt: new Date() },
  { id: '6', phoneNumber: '470-555-0103', areaCode: '470', isAvailable: true, createdAt: new Date() },

  // 678 numbers
  { id: '7', phoneNumber: '678-555-0101', areaCode: '678', isAvailable: true, createdAt: new Date() },
  { id: '8', phoneNumber: '678-555-0102', areaCode: '678', isAvailable: true, createdAt: new Date() },
  { id: '9', phoneNumber: '678-555-0103', areaCode: '678', isAvailable: true, createdAt: new Date() },

  // 770 numbers
  { id: '10', phoneNumber: '770-555-0101', areaCode: '770', isAvailable: true, createdAt: new Date() },
  { id: '11', phoneNumber: '770-555-0102', areaCode: '770', isAvailable: true, createdAt: new Date() },
  { id: '12', phoneNumber: '770-555-0103', areaCode: '770', isAvailable: true, createdAt: new Date() },
]

/**
 * Assign a phone number based on zip code
 */
export async function assignPhoneNumberForZipCode(zipCode: string): Promise<{
  success: boolean
  phoneNumber?: string
  areaCode?: string
  location?: ZipCodeMapping
  error?: string
}> {
  // Check if zip code is supported
  if (!isZipCodeSupported(zipCode)) {
    return {
      success: false,
      error: `Zip code ${zipCode} is not currently supported.`
    }
  }

  // Get area code for zip code
  const areaCode = getAreaCodeForZipCode(zipCode)
  const location = getLocationForZipCode(zipCode)

  if (!areaCode) {
    return {
      success: false,
      error: 'Could not determine area code for zip code'
    }
  }

  // Find available phone number in that area code
  const availableNumber = MOCK_PHONE_POOL.find(
    phone => phone.areaCode === areaCode && phone.isAvailable
  )

  if (!availableNumber) {
    // Try to find any available number
    const fallbackNumber = MOCK_PHONE_POOL.find(
      phone => phone.isAvailable
    )

    if (!fallbackNumber) {
      return {
        success: false,
        error: 'No phone numbers available. Please contact support.'
      }
    }

    // Assign fallback number
    fallbackNumber.isAvailable = false
    fallbackNumber.assignedToZipCode = zipCode

    return {
      success: true,
      phoneNumber: fallbackNumber.phoneNumber,
      areaCode: fallbackNumber.areaCode,
      location,
    }
  }

  // Assign the number
  availableNumber.isAvailable = false
  availableNumber.assignedToZipCode = zipCode

  return {
    success: true,
    phoneNumber: availableNumber.phoneNumber,
    areaCode,
    location,
  }
}

/**
 * Release a phone number back to the pool
 */
export async function releasePhoneNumber(phoneNumber: string): Promise<boolean> {
  const phone = MOCK_PHONE_POOL.find(p => p.phoneNumber === phoneNumber)
  if (phone) {
    phone.isAvailable = true
    phone.assignedToZipCode = undefined
    return true
  }
  return false
}

/**
 * Get available phone numbers for an area code
 */
export function getAvailableNumbers(areaCode: string): PhoneNumber[] {
  return MOCK_PHONE_POOL.filter(
    phone => phone.areaCode === areaCode && phone.isAvailable
  )
}

/**
 * Get phone number usage statistics
 */
export function getPhoneNumberStats() {
  const total = MOCK_PHONE_POOL.length
  const assigned = MOCK_PHONE_POOL.filter(p => !p.isAvailable).length
  const available = total - assigned

  const byAreaCode = MOCK_PHONE_POOL.reduce((acc, phone) => {
    if (!acc[phone.areaCode]) {
      acc[phone.areaCode] = { total: 0, assigned: 0, available: 0 }
    }
    acc[phone.areaCode].total++
    if (phone.isAvailable) {
      acc[phone.areaCode].available++
    } else {
      acc[phone.areaCode].assigned++
    }
    return acc
  }, {} as Record<string, { total: number; assigned: number; available: number }>)

  return {
    total,
    assigned,
    available,
    byAreaCode
  }
}