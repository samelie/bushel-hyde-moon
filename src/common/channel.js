'use strict';

// Vendor dependencies
import Backbone from 'backbone';

import Radio from 'backbone.radio';

// Instantiate
const Channel = Radio.channel('app');
// Events: let the app know that something happened
// Export
export default Channel;
