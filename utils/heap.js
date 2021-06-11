// A min heap node
class HeapNode {

    element; // The element to be stored

    // index of the array from
    // which the element is taken
    i;

    // index of the next element
    // to be picked from array
    j;

    constructor(element, i, j) {
        this.element = element;
        this.i = i;
        this.j = j;
    }
}

// A class for Min Heap
class Heap {

    harr; // Array of elements in heap (MinHeapNode[])
    heap_size; // Current number of elements in min heap
    compareValues; // e.g. 'priceValue'

    constructor(/*MinHeapNode[]*/ a, /*int*/ size, compareValues) {
        this.heap_size = size;
        this.harr = a;
        this.compareValues = compareValues;
    }

    // A recursive method to heapify a subtree
    // with the root at given index This method
    // assumes that the subtrees are already heapified
    heapify(/*index*/ i) {
        // this is a stub
    }

    // to get index of left child of node at index i
    left(i) { return (2*i + 1); }

    // to get index of right child of node at index i
    right(i) { return (2*i + 2); }

    // to get the root (return MinHeapNode)
    getRoot() {
        if(this.heap_size <= 0) {
            console.log("Heap underflow");
            return null;
        }
        return this.harr[0];
    }

    // A utility function to swap two heap nodes
    swap(/*heapNode[]*/ arr, i, j) {
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    // to replace root with new node
    // "root" and heapify() new root
    replace(/*MinHeapNode*/ root) {
        this.harr[0] = root;
        this.heapify(0);
    }

};

module.exports = {Heap, HeapNode};
