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
    return "Belum diketahui";
  }
  
  if (age.years === 0) {
    return `${age.months} bulan`;
  }
  
  if (age.months === 0) {
    return `${age.years} tahun`;
  }
  
  return `${age.years} tahun ${age.months} bulan`;
};

export const getAgeInYears = (birthdate) => {
  const age = calculateAge(birthdate);
  return age.years;
};

export const getAgeInMonths = (birthdate) => {
  const age = calculateAge(birthdate);
  return (age.years * 12) + age.months;
};

export const formatAgeShort = (birthdate) => {
  const age = calculateAge(birthdate);
  
  if (age.years === 0 && age.months === 0) {
    return "N/A";
  }
  
  if (age.years === 0) {
    return `${age.months}bl`;
  }
  
  if (age.months === 0) {
    return `${age.years}th`;
  }
  
  return `${age.years}th ${age.months}bl`;
};