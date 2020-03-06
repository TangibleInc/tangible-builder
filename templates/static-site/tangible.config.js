module.exports = {
  type: '<%- projectType %>',
  build: [],
  serve: {
    src: '<%- sourceFolder %>',
    dest: '<%- destinationFolder %>',
    port: 3000
  }
}