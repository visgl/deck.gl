# Platform Support

deck.gl was designed to tap into the power of recent generations of browsers and hardware. It works extremely well for us in an environment where all users have relatively up-to-date hardware and software, but might need extra work to be working on wider range of less recent configuration.


## Browser Support

By choice we intentionally only support "evergreen" browsers, in particular Chrome, Firefox, Safari, and Edge (although we have limited access to Windows machines).

If there are browser related issues on the latest version of these browsers, we will try to address them.


## System Support

### GPU / OS support

We intend to support all WebGL-compliant platforms, which includes modern GPUs from major vendors, namely Nvidia, AMD and Intel running on latest macOS, Windows and popular distributions of Linux. However, there might be some combination of GPUs and OSes that part of or the whole deck.gl is not working properly.

We will make our best efforts to address the issue, please refer to the Known Compatibility Issues section for more info.


### Software Rendering under Mesa

We'd like to make software rendering under [Mesa](http://www.mesa3d.org/intro.html) a reliable option which could be used as a fallback for various Linux distributions and versions

Unit tests are already run under headless gl which uses a Mesa configuration on Travis CI, however we have not yet tested that rendered output is correct.


### Virtual Machines

Except for software renderer based on Mesa, we do not support running deck.gl in virtual machines, although we will consider PRs as outlined below.


### PR Policy

PRs for fixes to unsupported systems, e.g:
* Older browsers such as Internet Explorer
* Running deck.gl under Virtual Machines
will be considered as long as those fixes are limited in scope (no architectural impact or changes that could affect supported systems). However, even if we accept such PRs we will not do any testing on such environments.


### Known Compatibility Issues

1) Some 64-bit layers are not working on Linux machine with AMD r600 based GPUs with Mesa driver. The front-end compiler generates shader codes that exceeds the register limit of this specific series of GPUs. The workaround is either using software renderer or AMD's proprietary graphics driver
