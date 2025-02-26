module.exports = {
  apiKey: 'c7184a5189a10521e223c3a3339e06b0272edada',
  projectId: '7835424467bf5c965b0411.50285011',
  languages: ['fr', 'en', 'es'],
  files: {
    upload: [
      {
        file: 'src/locale/messages.xlf',
        lang_iso: 'fr',
        type: 'xliff',
        tags: ['angular'],
        description: 'Angular i18n source file'
      }
    ],
    download: {
      directory: 'src/locale',
      format: 'xliff',
      original_filenames: false,
      filter_langs: ['fr', 'en', 'es'],
      replace_breaks: false
    }
  }
};
