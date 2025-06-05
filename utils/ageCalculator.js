export const calculateAge = (birthdate) => {
  if (!birthdate) return { years: 0, months: 0 };
  
  const today = new Date();
  const birth = new Date(birthdate);
  
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (today.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  return { years, months };
};

export const formatAge = (birthdate) => {
  const age = calculateAge(birthdate);
  
  if (age.years === 0 && age.months === 0) {
    return "Unknown";
  }
  
  if (age.years === 0) {
    return `${age.months} month${age.months !== 1 ? 's' : ''} old`;
  }
  
  if (age.months === 0) {
    return `${age.years} year${age.years !== 1 ? 's' : ''} old`;
  }
  
  return `${age.years} year${age.years !== 1 ? 's' : ''} ${age.months} month${age.months !== 1 ? 's' : ''} old`;
};

export const getAgeInYears = (birthdate) => {
  const age = calculateAge(birthdate);
  return age.years;
};

export const getAgeInMonths = (birthdate) => {
  const age = calculateAge(birthdate);
  return (age.years * 12) + age.months;
};