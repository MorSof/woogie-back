const {Heap} = require('./heap');

// A class for Min Heap
class MinHeap extends Heap{

    // Constructor: Builds a heap from
    // a given array a[] of given size
    constructor(/*MinHeapNode[]*/ a, /*int*/ size, compareValues) {
        super(a, size, compareValues);
        let i = parseInt((this.heap_size - 1)/2);
        while (i >= 0) {
            this.heapify(i);
            i--;
        }
    }

// A recursive method to heapify a subtree
    // with the root at given index This method
    // assumes that the subtrees are already heapified
    heapify(/*index*/ i) {
        let l = this.left(i);
        let r = this.right(i);
        let smallest = i;
        if (l < this.heap_size && this.harr[i].element.compareByMulKeys(this.harr[l].element, this.compareValues) == 1)
            smallest = l;
        if (r < this.heap_size && this.harr[smallest].element.compareByMulKeys(this.harr[r].element, this.compareValues) == 1)
            smallest = r;
        if (smallest != i) {
            this.swap(this.harr, i, smallest);
            this.heapify(smallest);
        }
    }

};

module.exports = MinHeap
