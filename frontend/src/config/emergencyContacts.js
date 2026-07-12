export const emergencyConfig = {
  services: [
    { type: 'Cardiac Emergency', service: 'Ambulance', number: '108', description: 'Requires immediate medical intervention.' },
    { type: 'Stroke', service: 'Ambulance', number: '108', description: 'Requires immediate medical intervention.' },
    { type: 'High Blood Pressure Crisis', service: 'Ambulance', number: '108', description: 'Requires immediate medical intervention.' },
    { type: 'Diabetic Emergency', service: 'Ambulance', number: '108', description: 'Requires immediate medical intervention.' },
    { type: 'Breathing Difficulty', service: 'Ambulance', number: '108', description: 'Requires oxygen support immediately.' },
    { type: 'Unconscious Patient', service: 'Ambulance', number: '108', description: 'Requires immediate medical intervention.' },
    { type: 'Pregnancy Emergency', service: 'Ambulance', number: '108', description: 'Maternal health ambulance or 108.' },
    { type: 'Child Emergency', service: 'Ambulance', number: '108', description: 'Requires immediate medical intervention.' },
    { type: 'Severe Injury / Accident', service: 'Ambulance', number: '108', description: 'Trauma care response.' },
    { type: 'Snake Bite', service: 'Ambulance', number: '108', description: 'Anti-venom treatment required immediately.' },
    { type: 'Poisoning', service: 'Ambulance', number: '108', description: 'Emergency poison control / medical response.' },
    { type: 'Infectious Disease', service: 'Primary Health Centre', number: '104', description: 'Contact local Medical Officer.' },
    { type: 'Mental Health Emergency', service: 'District Mental Health Helpline', number: '104', description: 'Helpline for psychiatric emergencies.' },
    { type: 'Other', service: 'Primary Health Centre', number: '104', description: 'General medical assistance.' }
  ],
  defaults: {
    'PHC_DEFAULT': '104'
  }
};
