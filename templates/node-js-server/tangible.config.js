module.exports = {
  build: [
    {
      task: 'babel',
      src: '<%- sourceFolder %>/**/*.{js,ts,tsx}',
      dest: '<%- destinationFolder %>',
      watch: '<%- sourceFolder %>/**/*.{js,ts,tsx}',
      root: ['<%- sourceFolder %>']
    },
 ],
}