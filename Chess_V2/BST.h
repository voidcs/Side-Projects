#include <iostream>
using namespace std;


#ifndef BST_H
#define BST_H

class BST{
    string data;    //Information for node (coordinate)
    BST *left, *right;  //Left and right 
    
    public:
        BST();  //Default Constructor
        BST(string);    //Constructor given value of root node
        BST* insert(BST *, string); //Insert new node
        void print(BST *);          //Print the tree in order
};

BST::BST(){
    data = "";  //Set all to NULL
    left = NULL;
    right = NULL;
}

BST::BST(string x){
    data = x;   //Set data to given value
    left = right = NULL;
}

BST* BST::insert(BST *root, string x){
    
    //If node is not root, create new node with given value
    if(!root)
        return new BST(x);
    
    //If greater, insert right
    if(x > root->data)
        root->right = insert(root->right, x);
    //Else insert left
    else{
        root->left = insert(root->left, x);
    }
    
    return root;
}

void BST::print(BST *root){
    if(!root)
        return;
    
    print(root->left);
    cout<<root->data<<" ";
    print(root->right);
}




#endif /* BST_H */

