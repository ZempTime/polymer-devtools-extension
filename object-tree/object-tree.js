(function () {
  function newExpandBtnState (present) {
    return present === '+' ? '-' : '+';
  }
  /**
  * Tells if the new value of the field is valid or not
  */
  function isFieldValueValid (val) {
    var validValues = ['true', 'false', 'undefined', 'null'];
    if ((validValues.indexOf(val) !== -1) ||
      (val.length >= 2 &&
      (val[0] === '"' && val[val.length - 1] === '"') ||
      (val[0] === '\'' && val[val.length - 1] === '\'')) ||
      !isNaN(parseInt(val, 10))) {
      return true;
    }
    return false;
  }
  Polymer('object-tree', {
    indent: 0,
    collapsed: true,
    baseWidth: 10,
    expandBtnText: '+',
    // Value of the property (to the right)
    contentText: '',
    // Text of the property (to the left)
    labelText: '',
    // Meta-information like <object> or <array>
    typeText: '',
    // Some keys are objects/arrays and don't need an immediate value
    valueNeeded: false,
    // Only objects and arrays need the expand button
    expandBtnNeeded: true,
    expandBtnNeededChanged: function (oldValue, newValue) {
      if (newValue) {
        this.expandBtnText = this.collapsed ? '+' : '-';
      } else {
        this.expandBtnText = ' ';
      }
    },
    collapsedChanged: function (oldValue, newValue) {
      this.expandBtnText = newValue ? '+' : '-';
    },
    ready: function () {
      this.childElements = [];
      this.$.childrenContent.style.marginLeft = this.indent + this.baseWidth + 'px';
      // When the editable-field changes
      this.addEventListener('field-changed', function (event) {
        var newValue = event.detail.newValue;
        var oldValue = event.detail.oldValue;
        var path = this.path;
        // Stop propagation since this will fire another event
        event.stopPropagation();
        if (!isFieldValueValid(newValue)) {
          this.$.editableLabel.text = oldValue;
          return;
        }
        // Fire an event with all the information
        this.fire('property-changed', {
          path: path,
          value: newValue
        });
      });
    },
    addChild: function (element) {
      this.childElements.push(element);
      this.$.childrenContent.appendChild(element);
    },
    /**
    * Remove all children from the tree
    */
    removeChildren: function () {
      while (this.$.childrenContent.firstChild) {
        this.$.childrenContent.removeChild(this.$.childrenContent.firstChild);
      }
      this.childElements = [];
    },
    /**
    * Add a property as a child
    */
    addChildProp: function (propObj, path) {
      var child = new ObjectTree();
      child.init(propObj, path);
      this.addChild(child);
    },
    /**
    * Empties the object-tree
    */
    empty: function () {
      this.labelText = '';
      this.typeText = '';
      this.valueNeeded = false;
      this.expandBtnText = '-';
      this.collapsed = true;
      this.removeChildren();
    },
    init: function (obj, path) {
      this.labelText = obj.name;
      this.path = path;
      if (obj.type === 'object' || obj.type === 'array') {
        this.typeText = '<' + obj.type + '>';
      } else {
        this.expandBtnNeeded = false;
        this.valueNeeded = true;
        this.contentText = obj.value;
        if (obj.type === 'string') {
          this.contentText = '"' + this.contentText + '"';
        }
      }
    },
    /**
    * Pre-populates the object-tree with a given tree
    */
    initFromObjectTree: function (tree) {
      this.empty();
      this.labelText = tree.name;
      this.collapsed = false;
      this.expandBtnNeeded = false;
      this.typeText = '<' + tree.type + '>';
      for (var key in tree.value) {
        if (tree.value.hasOwnProperty(key)) {
          this.addChildProp(tree.value[key], [key]);
        }
      }
    },
    /**
    * Collapse/Uncollapse
    */
    toggle: function () {
      if (!this.expandBtnNeeded) {
        return;
      }
      this.collapsed = !(this.collapsed);
      var that = this;
      if (this.collapsed) {
        this.removeChildren();
        this.fire('object-collapse', {
          path: that.path,
          treeNode: that
        });
      } else {
        this.fire('object-expand', {
          path: that.path,
          treeNode: that
        });
      }
    }
  });
})();