(function() {
    window.initPoemShell = function(options) {
        var title = options && options.title ? options.title : 'Poem';
        var category = options && options.category ? options.category : 'Poem';
        var contentSelector = options && options.contentSelector ? options.contentSelector : '#poem-body';

        var titleEl = document.getElementById('poem-title');
        var crumbEl = document.getElementById('crumb-title');
        if (titleEl) titleEl.textContent = title;
        if (crumbEl) crumbEl.textContent = title;

        var subtitleEl = document.getElementById('poem-subtitle');
        if (subtitleEl) subtitleEl.textContent = category;

        var contentHost = document.getElementById('poem-content');
        var source = document.querySelector(contentSelector);
        if (contentHost && source) {
            contentHost.innerHTML = source.innerHTML;
            source.parentNode.removeChild(source);
        }
    };

    window.toggleTheme = function() {
        var currentTheme = document.documentElement.getAttribute('data-theme');
        var newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        try { localStorage.setItem('theme', newTheme); } catch (e) {}
    };

    (function initTheme() {
        try {
            var savedTheme = localStorage.getItem('theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            var theme = savedTheme || (prefersDark ? 'dark' : 'dark');
            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', 'light');
            }
        } catch (e) {}
    })();
})();


