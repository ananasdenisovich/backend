function showLevelButtons(language) {
  document.getElementById('levelButtons').style.display = 'none';

  document.getElementById('levelButtons').style.display = 'flex';

  document.querySelectorAll('.tab-pane').forEach(function (tab) {
    tab.classList.remove('active');
  });
}

function showTab(level) {
  document.querySelectorAll('.tab-pane').forEach(function (tab) {
    tab.classList.remove('active');
  });

  var language = document.querySelector('.btn-primary.active').innerText.toLowerCase();
  var tabId = language + '-' + level;
  document.getElementById(tabId).classList.add('active');
}
