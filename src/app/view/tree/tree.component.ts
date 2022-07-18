import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { TreeService } from 'src/app/services/tree/tree.service';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {

  treeControl = new NestedTreeControl<FoodNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<FoodNode>();

  constructor(public treeNav: TreeService) {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: FoodNode) => !!node.children && node.children.length > 0;

  ngOnInit(): void {
  }

}

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
 interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Audio',
    children: [
      {
        name: 'Earphones',
        children: [
          {name: 'Bluetooth'}, {name: 'True Wireless'}, {name: 'Wired'}
        ]
      }, 
      {
        name: 'Headphones',
        children: [
          {name: 'Bluetooth'}, {name: 'True Wireless'}, {name: 'Wired'}
        ]
      }, 
      {
        name: 'Speakers',
        children: [
          {name: 'Bluetooth'}, {name: 'True Wireless'}, {name: 'Wired'}
        ]
      }],
  },
  {
    name: 'Automobile',
    children: [{name: 'View All'}],
  },
  {
    name: 'Bags',
    children: [{name: 'View All Bags'}],
  },
  {
    name: 'Cables',
    children: [{name: 'Adapter'}, {name: 'USB'}, {name: 'HDMI/VGA'}],
  },
  {
    name: 'Multtimedia',
    children: [{name: 'View All'}],
  },
  {
    name: 'Kitchen',
    children: [{name: 'Air Fryer'}, {name: 'Kettle'}, {name: 'Coffee Maker'}]
  },
];
