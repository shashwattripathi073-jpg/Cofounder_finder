export function calculateCompatibility(userSkills = [], requiredSkills = []) {
    if (!userSkills || !requiredSkills || !userSkills.length || !requiredSkills.length) return 0;
    
    const _userSkills = userSkills.map(s => s.toLowerCase().trim());
    const _reqSkills = requiredSkills.map(s => s.toLowerCase().trim());
    
    const matched = _reqSkills.filter(req => _userSkills.includes(req));
    
    // Avoid division by zero (though handled by length check above)
    const score = Math.round((matched.length / _reqSkills.length) * 100);
    return score;
}
