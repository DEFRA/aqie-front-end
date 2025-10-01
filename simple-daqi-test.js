// SIMPLE DAQI TEST - Copy each block separately and run one at a time

// BLOCK 1: Copy and paste this first, then press Enter
console.log('🧪 Loading DAQI Test Functions...');

// BLOCK 2: Copy and paste this second, then press Enter
function testRealDAQI() {
  console.log('🔍 Testing Real DAQI Functionality...');
  
  // Check DAQI elements exist
  const daqiBar = document.querySelector('.daqi-bar');
  const daqiSegments = document.querySelectorAll('.daqi-bar-segment');
  
  if (daqiBar) {
    console.log('✅ DAQI bar found with', daqiSegments.length, 'segments');
  } else {
    console.log('❌ No DAQI bar found - are you on a location page?');
    return;
  }
  
  // Check CSS custom properties
  const daqiContainer = document.querySelector('.daqi-numbered');
  if (daqiContainer) {
    const styles = getComputedStyle(daqiContainer);
    const divider1 = styles.getPropertyValue('--daqi-divider-1');
    console.log('✅ CSS divider property:', divider1 || 'not set');
  }
  
  // Check for real data
  const activeTabs = document.querySelectorAll('.govuk-tabs__tab[data-daqi-value]');
  console.log('✅ Found', activeTabs.length, 'DAQI tabs');
  
  console.log('🌬️ Real DAQI test complete!');
}

// BLOCK 3: Copy and paste this third, then press Enter
function simulateDAQIValue(value) {
  console.log('🎯 Setting DAQI to value', value);
  
  const segments = document.querySelectorAll('.daqi-bar-segment');
  if (segments.length === 0) {
    console.log('❌ No segments found');
    return;
  }
  
  // Reset all
  segments.forEach(segment => {
    segment.className = 'daqi-bar-segment daqi-0';
  });
  
  // Activate up to value
  segments.forEach((segment, index) => {
    if (index < value) {
      segment.className = `daqi-bar-segment daqi-${value}`;
    }
  });
  
  const colors = ['', '🟢 Green', '🟢 Green', '🟢 Green', '🟡 Yellow', '🟡 Yellow', '🟡 Yellow', '🔴 Red', '🔴 Red', '🔴 Red', '🟣 Purple'];
  console.log('✅ Applied:', colors[value]);
}

// BLOCK 4: Copy and paste this last, then press Enter
console.log('🚀 Functions ready!');
console.log('Now you can run:');
console.log('testRealDAQI()');
console.log('simulateDAQIValue(5)');
console.log('simulateDAQIValue(8)');
console.log('simulateDAQIValue(10)');