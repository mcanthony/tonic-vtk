# Tonic VTK

## Goal

__Tonic VTK__ is meant to provide a set of components that could easily be used
to build VTK-Web and ParaViewWeb applications. This could range from utility
classes for connection establishment to concrete widgets for UI building.

### Testing

If you have a ParaView installed locally with the Python wrapping available,
you should be able to run the visualization example (Unless you are on Windows).

To do so, you will have to configure your environment to know where the pieces
are located.

```sh
$ npm config set tonic-vtk:pvpython   /.../ParaView/bin/pvpython
$ npm config set tonic-vtk:visualizer /.../ParaView/lib/site-packages/paraview/web/pv_web_visualizer.py
$ npm config set tonic-vtk:launcher   /.../ParaView/lib/site-packages/vtk/web/launcher.py
$ npm install
$ npm start
...
$ npm stop
```

This will start the launcher at __http://localhost:8080/__ where all the demo
application/sample will be available. Some demo, do not provide any user control
but create a setup environment for testing using the interactive console from
your browser.

### Licensing

**tonic-vtk** is licensed under [BSD Clause 3](LICENSE).

### Getting Involved

Fork our repository and do great things. At [Kitware](http://www.kitware.com),
we've been contributing to open-source software for 15 years and counting, and
want to make **tonic-vtk** useful to as many people as possible.
